const express = require('express');
const pg = require('pg');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, '../react-rise/build')));

const db = new pg.Client({
  user: process.env.DB_USER, 
  host: process.env.DB_HOST, 
  database: process.env.DB_NAME, 
  password: process.env.DB_PASSWORD, 
  port: process.env.DB_PORT, 
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
  clientID: process.env.GOOGLE_CLIENT_ID, 
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
  callbackURL: process.env.GOOGLE_CALLBACK_URL, 
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
        // information can be sent from here
      }
    });
  } else {
    res.status(200).json({
      loggedIn: false,
      user: null
    });
  }
});

app.get('/api/tasks', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const userId = req.user.id;

  try {
    const result = await db.query('SELECT * FROM tasks WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  console.log(req.body); 
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { title, alarm } = req.body;
  const userId = req.user.id;
  const isFixedBoolean = false;

  try {
    const result = await db.query(
      'INSERT INTO tasks (title, alarm, isFixed, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, alarm, isFixedBoolean, userId]
    );
    console.log(result);
    res.status(201).json(result.rows[0]); 
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

app.delete('/api/tasks', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { id } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
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
