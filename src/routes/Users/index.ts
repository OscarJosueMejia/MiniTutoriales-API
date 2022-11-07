import express from 'express';
import { Users } from '@libs/Users';
import { body, validationResult } from 'express-validator';

const router = express.Router();
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

router.post(
  '/signin',
  body('email').isEmail().withMessage('Correo inválido'),
  body('username').isLength({ min: 6 }).withMessage('Usuario mínimo 6 caracteres'),
  body('password').isStrongPassword().withMessage('Contraseña insegura'),
  async (req, res) => {
    try {
      const { username, email, password, roles } = req.body;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() });
      }

      const result = await users.signin(username, email, password, roles);
      return res.status(200).json({ msg: 'Usuario Creado Correctamente', result });
    } catch (ex) {
      console.log('Error:', ex);
      return res.status(500).json({ error: 'Error al crear usuario' });
    }
  },
);

router.post('/login', 
body('email').isEmail().withMessage('Correo inválido'),
async (req, res) => {
  try {
    const { email, password } = req.body;

    const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() });
      }

    const result = await users.login(email, password);

    console.log('LOGIN:', result);
    res.cookie('jwt', result.token, {
      httpOnly: true,
      sameSite: 'none',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(result);
  } catch (ex) {
    console.log('Error:', ex);
    return res.status(403).json({ error: 'Credenciales no son válidas' });
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

router.post('/changePassword', 
body('email').isEmail().withMessage('Correo inválido'),
body('newPassword').isStrongPassword().withMessage('Contraseña insegura'),
body('oldPassword').notEmpty().withMessage('Contraseña anterior requerida'),
async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }

    await users.changePassword(email, oldPassword, newPassword);

    return res.status(200).json({ msg: 'Contraseña Actualizada' });
  } catch (error) {
    console.log('Error:', error);
    return res.status(403).json({ error: (error as Error).message });
  }
});

router.post('/generateRecoveryPin', 
body('email').isEmail().withMessage('Correo inválido'),
async (req, res) => {
  try {
    const { email } = req.body;
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }

    const result = await users.generateRecoveryCode(email);

    return res.status(200).json(result);
  } catch (error) {
    console.log('Error:', error);
    return res.status(403).json({ error: (error as Error).message });
  }
});

router.post('/recoveryChangePassword',
body('email').isEmail().withMessage('Correo inválido'),
body('pin').isInt({min: 100000, max: 999999}).withMessage('Pin debe ser de 6 dígitos'),
body('newPassword').isStrongPassword().withMessage('Contraseña insegura'),
async (req, res) => {
  try {
    const { email, pin, newPassword } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }

    await users.verifyRecoveryData(email, pin, newPassword);
    return res.status(200).json({ msg: 'Contraseña Actualizada' });
  } catch (error) {
    console.log('Error:', error);
    return res.status(403).json({ error: (error as Error).message });
  }
});

export default router;
