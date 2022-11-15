import express from 'express';
import passport from 'passport';
import { Users } from '@libs/Users';
import { ensureAuthenticated } from '@server/middleware/ensureAuthentication';

const router = express.Router();
const users = new Users();

type UserOutlook = {
  _json?: {
    EmailAddress?: string;
    DisplayName?: string;
  };
};

router.get('/', (req, res) => {
  res.render('layout', { user: req.user });
});

router.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account', { user: req.user });
});

router.get('/login', function (req, res) {
  res.render('login', { user: req.user });
});

// GET /auth/outlook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Outlook authentication will involve
//   redirecting the user to outlook.com.  After authorization, Outlook
//   will redirect the user back to this application at
//   /auth/outlook/callback
router.get(
  '/outlook',
  passport.authenticate('windowslive', {
    scope: [
      'openid',
      'profile',
      'offline_access',
      'https://outlook.office.com/Mail.Read',
    ],
    session: false,
  }),
  function (_req, _res) {
    // The request will be redirected to Outlook for authentication, so
    // this function will not be called.
  },
);

// GET /auth/outlook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get(
  '/outlook/callback',
  passport.authenticate('windowslive', { failureRedirect: '/auth/login' }),
  async function (req, res) {
    try {
      const userToInsert: UserOutlook = req.user;
      const result = await users.signin(
        userToInsert._json.DisplayName.replace(/\s/g, ''),
        userToInsert._json.EmailAddress,
        'OUTLOOKSIGNIN',
      );
      console.log('Usuario creado exitosamente ', result);
      res.redirect('/auth/index');
    } catch (error) {
      console.log('ERROR ', error);
    }
  },
);

router.get('/index', ensureAuthenticated, (req, res) => {
  res.render('index', { user: req.user });
});

router.get('/logout', function (req, res) {
  req.logout(() => {
    console.log('Done.');
  });
  res.redirect('/auth/');
});

export default router;
