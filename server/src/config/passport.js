const passport      = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { v4: uuidv4 } = require('uuid');
const pool          = require('./db');

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email    = profile.emails[0].value;
        const googleId = profile.id;
        const name     = profile.displayName;
        const avatar   = profile.photos[0]?.value || null;

        // 1. Check by google_id (returning OAuth user)
        let [rows] = await pool.query(
          'SELECT * FROM users WHERE google_id = ?',
          [googleId]
        );
        let user = rows[0];

        if (!user) {
          // 2. Check by email (existing local account — auto-link)
          [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
          );
          user = rows[0];

          if (user) {
            // Auto-link google_id to existing local account
            const newProvider =
              user.auth_provider === 'local' ? 'both' : user.auth_provider;
            await pool.query(
              'UPDATE users SET google_id = ?, avatar_url = ?, auth_provider = ? WHERE id = ?',
              [googleId, avatar, newProvider, user.id]
            );
            user.google_id     = googleId;
            user.avatar_url    = avatar;
            user.auth_provider = newProvider;
          } else {
            // 3. Brand new user — create Google-only account
            const id = uuidv4();
            await pool.query(
              `INSERT INTO users (id, full_name, email, google_id, avatar_url, auth_provider, role)
               VALUES (?, ?, ?, ?, ?, 'google', 'user')`,
              [id, name, email, googleId, avatar]
            );
            [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
            user = rows[0];
          }
        }

        if (user.status === 'banned') {
          return done(null, false, { message: 'Account is banned.' });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
