import express from 'express';
import { Users } from '@libs/Users';
import { body, validationResult } from 'express-validator';
import parser from 'ua-parser-js';

const router = express.Router();
const users = new Users();

router.get('/getAll', async (req, res) => {
  try {
    const {page, items} = {page:"1", items:"10", ...req.query};
    const result = await users.getAllUsers(Number(page), Number(items));
    
    res.status(200).json(result);
  } catch (ex) {
    console.log('Error:', ex);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

router.post('/signin',
  body('name').isLength({ min: 6 }).withMessage('Nombre mínimo 6 caracteres'),
  body('email').isEmail().withMessage('Correo inválido'),
  body('password').isStrongPassword().withMessage('Contraseña insegura'),
  async (req, res) => {
    try {
      const { name, email, password, rol } = req.body;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() });
      }

      let result:object;

      if (!rol || rol.length === 0) {
        result = await users.signin(name, email, password);
      } else {
        result = await users.signin(name, email, password, rol);
      }
      return res.status(200).json({ msg: 'Usuario Creado Correctamente', result });
    } catch(error) {
      console.log("Error:", error);
      return res.status(403).json({error: (error as Error).message});
    }
  });

router.post('/verifyAccount', async (req, res)=> {
  try {
    const {email, pin} = req.body;
    console.log(email, pin);
    const result = await users.VerifyAccount(email, pin);
    res.status(200).json({"msg":"Cuenta Verificada", result});
  } catch(error) {
    console.log("Error:", error);
    res.status(403).json({error: (error as Error).message});
  }
});

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

router.get('/logout', async (_req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ msg: 'Sesión Cerrada Correctamente.' });
});
router.put('/update/:id', async (req, res)=> {
  try {
    const {id} = req.params;
    const { email, password} = req.body;
    const result = await users.updatePublic(id, email, password);    

    res.status(200).json({"msg":"Usuario Actualizado Correctamente", result});
  } catch(ex) {
    console.log("Error:", ex);
    res.status(500).json({error:"Error al Actualizar usuario"});
  }
});

router.put('/updateStatus/:id/:status', async (req, res)=>{
  try {
    const { id, status } = req.params;
    
    await users.updateStatus(id as string, status);

    res.status(200).json({"msg":"Registro Actualizado"});
  } catch(error) {
    res.status(500).json({error: (error as Error).message});
  }
});

router.get('/profile/:id', async (req, res)=> {
  try {
    const {id} = req.params;
    const result = await users.getUsersById(id);
    res.status(200).json(result);
  } catch(ex) {
    console.log("Error:", ex);
    res.status(500).json({error:"Error al crear usuario"});
  }
});

// router.post('/login', async (req, res)=> {
//   try {
//     const {email, password} = req.body;
//     const result = await users.login(email, password);

router.post('/addrole/:id', async (req, res) => {
  try {

    const { id } = req.params;
    const {role} = req.body;

    const result = await users.assignRoles(id, role);
    console.log('ADD_ROLE ', result);
    res.status(200).json(result);

  } catch (error) {

  }
});

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

    const user_agent = parser(req.headers['user-agent']);
    
    const result = await users.generateRecoveryCode(email, {
      operating_system: user_agent.os.name, 
      browser_name: user_agent.browser.name
    });

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

router.post('/verifyRecoveryPin',
body('email').isEmail().withMessage('Correo inválido'),
body('pin').isInt({min: 100000, max: 999999}).withMessage('Pin debe ser de 6 dígitos'),
async (req, res) => {
  try {
    const { email, pin } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }

    await users.verifyRecoveryPin(pin, email);
    return res.status(200).json({ msg: 'Pin Correcto' });
  } catch (error) {
    console.log('Error:', error);
    return res.status(403).json({ error: (error as Error).message });
  }
});

export default router;
