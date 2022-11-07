import { getConnection } from '@models/mongodb/MongoDBConn';
import { UsersDao } from '@models/mongodb/UsersDao';
import { getPassword, checkPassword } from '@utils/crypto';
import { sign, signOptions, verify } from '@utils/jwt';
import generateRandomNumber from '@utils/pinGenerator';
import { emailSender } from '@config/email';

const availableRole = ['public', 'admin', 'auditor', 'support'];

export class Users {
  private dao: UsersDao;
  public constructor() {
    getConnection()
      .then((conn) => {
        this.dao = new UsersDao(conn);
      })
      .catch((ex) => console.error(ex));
  }

  public getAllUsers() {
    return this.dao.getAllUsers();
  }

  public signin(username: string, email: string, password: string, roles:[string]=['public']) {
    const currentDate = new Date();
    const newUser = {
      username,
      email,
      password: getPassword(password),
      status: 'ACT',
      oldPasswords: [] as string[],
      created: currentDate,
      updated: currentDate,
      failedAttempts: 0,
      lastLogin: currentDate,
      avatar: '',
      roles: roles,
      _id: null,
    };
    return this.dao.createUser(newUser);
  }

  public async login(email: string, password: string) {
    try {
      const user = await this.dao.getUserByEmail(email);
      if (!!!user) {
        console.log('LOGIN: USER NOT FOUND', `${email}`);
        throw new Error('LOGIN USER NOT FOUND');
      }

      if (user.status !== 'ACT') {
        console.log(
          'LOGIN: STATUS NOT ACTIVE',
          `${user.email} - ${user.status}`,
        );
        await this.dao.updateUserFailed(user._id.toString());
        throw new Error('LOGIN STATUS INVALID');
      }
      if (!checkPassword(password, user.password)) {
        console.log(
          'LOGIN: INVALID PASSWORD',
          `${user.email} - ${user.status}`,
        );
        await this.dao.updateUserFailed(user._id.toString());
        throw new Error('LOGIN INVALID PASSWORD');
      }
      //Generate jwt
      const { username, email: emailUser, avatar, _id } = user;
      const returnUser = { username, email: emailUser, avatar, _id };

      await this.dao.updateLoginSuccess(_id.toString());

      return { ...returnUser, token: sign(returnUser) };
    } catch (error) {
      console.log('LOGIN: ', error);
      throw error;
    }
  }

  public async assignRoles(id: string, role: string){
    if (! availableRole.includes(role) ) {
        throw new Error(`Role ${role} must be ${availableRole.join(', ')} ` )
    }
    return this.dao.addRoleToUser(id, role);
  }

  public async changePassword(email, oldPassword, newPassword) {
    const user = await this.dao.getUserByEmail(email);

    if (!!!user) {
      console.log('Password Change: USER NOT FOUND', `${email}`);
      throw new Error('Password Change USER NOT FOUND');
    }
    if (!this.checkOldPassword(user.oldPasswords, newPassword)) {
      console.log(
        'Password Change: New password was previously used.',
        `${user.email}`,
      );
      throw new Error('New password was previously used.');
    }
    if (!checkPassword(oldPassword, user.password)) {
      console.log(
        'Password Change: Current passwords does not match.',
        `${user.email}`,
      );
      throw new Error('Current passwords does not match.');
    }
    if (oldPassword === newPassword) {
      console.log(
        'Password Change: Current Password must not be the same as New Password.',
        `${user.email}`,
      );
      throw new Error('Current Password must not be the same as New Password.');
    }

    const { _id, password } = user;
    let { oldPasswords } = user;

    oldPasswords.push(password);

    return this.dao.updateUser({
      _id,
      password: getPassword(newPassword),
      oldPasswords,
    });
  }

  public async generateRecoveryCode(email) {
    const user = await this.dao.getUserByEmail(email);
    if (!!!user) {
      console.log('ACCOUNT RECOVERY: USER NOT FOUND', `${email}`);
      throw new Error('ACCOUNT RECOVERY USER NOT FOUND');
    }
    if (user.status !== 'ACT') {
      console.log(
        'ACCOUNT RECOVERY: STATUS NOT ACTIVE',
        `${user.email} - ${user.status}`,
      );
      throw new Error('ACCOUNT RECOVERY STATUS INVALID');
    }
    const { email: emailUser, _id } = user;
    const recoveryPin = generateRandomNumber();
    const returnUser = { email: emailUser, _id, pin: recoveryPin };

    const preparedEmail = {
      email: emailUser,
      subject: 'Password Recovery Pin MiniTutos',
      templateName: 'emailtemplate', //El nombre del template que este dentro de la carpeta /config/htmlTemplates/
      context: {
        name: emailUser,
        pin: recoveryPin,
      },
    };

    await emailSender(preparedEmail);

    try {
      await this.dao.updateUser({
        passwordChangeToken: signOptions(returnUser, { expiresIn: '15m' }),
        _id,
      });
    } catch (error) {
      console.log('Error when saving recovery token');
    }

    return { returnUser };
  }

  public async verifyRecoveryData(
    email: string,
    pin: string,
    newPassword: string,
  ) {
    const user = await this.dao.getUserByEmail(email);

    if (!!!user) {
      console.log('ACCOUNT RECOVERY: USER NOT FOUND', `${email}`);
      throw new Error('ACCOUNT RECOVERY USER NOT FOUND');
    }
    if (!!!user.passwordChangeToken) {
      console.log('ACCOUNT RECOVERY: NO TOKEN FOUND', `${user.email}`);
      throw new Error('ACCOUNT RECOVERY NO TOKEN FOUND');
    }

    if (!this.checkOldPassword(user.oldPasswords, newPassword)) {
      console.log(
        'Password Change: New password was previously used.',
        `${user.email}`,
      );
      throw new Error('New password was previously used.');
    }
    if (checkPassword(newPassword, user.password)) {
      console.log(
        'Password Change: Current Password must not be the same as New Password.',
        `${user.email}`,
      );
      throw new Error('Current Password must not be the same as New Password.');
    }
    if (newPassword.length < 8) {
      console.log(
        'Password Change: Length must be greater than 0',
        `${user.email}`,
      );
      throw new Error('Password New length must be least');
    }

    const { _id, passwordChangeToken } = user;

    try {
      const decoded = verify(passwordChangeToken);
      if (decoded['pin'] !== parseInt(pin)) {
        throw new Error('INVALID RECOVERY PIN');
      }

      let { oldPasswords } = user;
      oldPasswords.push(user.password);

      await this.dao.deleteRecoveryToken({ _id });
      return await this.dao.updateUser({
        _id,
        password: getPassword(newPassword),
        oldPasswords,
      });
    } catch (error) {
      console.log('JWT-MIDDLEWARE: ', error);
      throw new Error('Invalid Token');
    }
  }

  public checkOldPassword(oldPasswords, newPassword: string) {
    let isIncluded = oldPasswords.filter(function (value) {
      return checkPassword(newPassword, value);
    });
    return isIncluded.length === 0;
  }
}
