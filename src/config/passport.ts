import passport from 'passport';
const OutlookStrategy = require('passport-outlook').Strategy;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Outlook profile is
//   serialized and deserialized.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new OutlookStrategy(
    {
      clientID: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      callbackURL: 'http://localhost:3001/auth/outlook/callback',
    },
    async function (_accessToken, _refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        // To keep the example simple, the user's Outlook profile is returned
        // to represent the logged-in user.  In a typical application, you would
        // want to associate the Outlook account with a user record in your
        // database, and return that user instead.
        return done(null, profile);
      });
    },
  ),
);

export default passport;
