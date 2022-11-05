import express from 'express';
const router = express.Router();
import { Users } from '@libs/Users';

const users = new Users();

router.get('/getAll', async (_req, res) => {
  try {
    const result = await users.getAllUsers();
    res.status(200).json(result);
  } catch (ex) {
    console.log('Error:', ex);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);
    const result = await users.signin(username, email, password);

    res.status(200).json({ msg: 'Usuario Creado Correctamente', result });
  } catch (ex) {
    console.log('Error:', ex);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await users.login(email, password);

    console.log('LOGIN:', result);
    res.cookie('jwt', result.token, {
      httpOnly: true,
      sameSite: 'none',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json(result);
  } catch (ex) {
    console.log('Error:', ex);
    res.status(403).json({ error: 'Credenciales no son válidas' });
  }
});

router.get('/logout', async (req, res) => {
  req.body;
  res.clearCookie('jwt');
  res.status(200).json({ msg: 'Sesión Cerrada Correctamente.' });
});

// router.post('/addrole/:id', async (req, res) => {
//   try {

//     const { id } = req.params;
//     const {role} = req.body;

//     const result = await users.assignRoles(id, role);
//     console.log('ADD_ROLE ', result);
//     res.status(200).json(result);

//   } catch (error) {

//   }
// })

router.post('/changePassword', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    await users.changePassword(email, oldPassword, newPassword);

    res.status(200).json({ msg: 'Contraseña Actualizada' });
  } catch (error) {
    console.log('Error:', error);
    res.status(403).json({ error: (error as Error).message });
  }
});

router.post('/generateRecoveryPin', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await users.generateRecoveryCode(email);

    res.status(200).json(result);
  } catch (error) {
    console.log('Error:', error);
    res.status(403).json({ error: (error as Error).message });
  }
});

router.post('/recoveryChangePassword', async (req, res) => {
  try {
    const { email, pin, newPassword } = req.body;

    await users.verifyRecoveryData(email, pin, newPassword);
    res.status(200).json({ msg: 'Contraseña Actualizada' });
  } catch (error) {
    console.log('Error:', error);
    res.status(403).json({ error: (error as Error).message });
  }
});

export default router;
