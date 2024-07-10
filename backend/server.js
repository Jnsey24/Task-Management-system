const express = require('express');
const pg = require('pg');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config(); // Load environment variables

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use environment variable
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../react-rise/build')));

// Database connection
const db = new pg.Client({
  user: process.env.DB_USER, // Use environment variable
  host: process.env.DB_HOST, // Use environment variable
  database: process.env.DB_NAME, // Use environment variable
  password: process.env.DB_PASSWORD, // Use environment variable
  port: process.env.DB_PORT, // Use environment variable
});
db.connect();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
};

app.post("/register", async (req, res) => {
  const { username, password, name, wakeuptime, sleeptime } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE username = $1", [username]);

    if (checkResult.rows.length > 0) {
      res.redirect("/login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
          res.redirect("/register");
        } else {
          const result = await db.query(
            "INSERT INTO users (username, password, name, wakeuptime, sleeptime) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [username, hash, name, wakeuptime, sleeptime]
          );
          const user = result.rows[0];
          passport.authenticate('local', (err, user, info) => {
            if (err) {
              console.error("Error during authentication:", err);
              res.redirect("/login");
            } else if (!user) {
              res.redirect("/login");
            } else {
              req.logIn(user, (err) => {
                if (err) {
                  console.error("Error logging in user:", err);
                  res.redirect("/login");
                } else {
                  res.redirect("/");
                }
              });
            }
          })(req, res);
        }
      });
    }
  } catch (err) {
    console.error("Database error:", err);
    res.redirect("/register");
  }
});

app.post("/login", (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send(info.message); 
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).send("Login successful");
    });
  })(req, res, next);
});

app.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Logout failed");
    }
    res.status(200).send("Logout successful");
  });
});

// Passport configuration
passport.use(
  "local",
  new LocalStrategy(async (username, password, cb) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else if (valid) {
            return cb(null, user);
          } else {
            return cb(null, false, { message: 'Incorrect password' });
          }
        });
      } else {
        return cb(null, false, { message: 'Incorrect username' });
      }
    } catch (err) {
      console.error("Database error:", err);
      return cb(err);
    }
  })
);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID, // Use environment variable
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Use environment variable
  callbackURL: process.env.GOOGLE_CALLBACK_URL, // Use environment variable
  passReqToCallback: true
},
async (request, accessToken, refreshToken, profile, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE google_id = $1", [profile.id]);
    if (result.rows.length > 0) {
      return cb(null, result.rows[0]);
    } else {
      const newUser = await db.query(
        "INSERT INTO users (username, google_id, name) VALUES ($1, $2, $3) RETURNING *",
        [profile.email, profile.id, profile.displayName]
      );
      return cb(null, newUser.rows[0]);
    }
  } catch (err) {
    return cb(err);
  }
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.get('/api/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      loggedIn: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        // Include any other user information you want to send to the frontend
      }
    });
  } else {
    res.status(200).json({
      loggedIn: false,
      user: null
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../react-rise/build', 'index.html'));
});

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = result.rows[0];
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
