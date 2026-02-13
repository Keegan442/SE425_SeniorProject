const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

/* LOGIN */
app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

    const result = await pool.query(
        `
        SELECT *
        FROM accounts
        WHERE email = $1
            OR username = $1
        `,
        [identifier]
    );

  if (result.rows.length === 0) {
    return res.status(401).json({ message: 'User not found' });
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  res.json({
    user: { accountId: user.account_id }
  });
});

/* SIGN UP */
app.post('/signup', async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      birthday
    } = req.body;

    if (!email || !password || !username || !firstName || !lastName || !birthday) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hash = await bcrypt.hash(password, 10);

    // birthday: "MM/DD/YYYY"
    const [month, day, year] = birthday.split('/');

    if (!month || !day || !year) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const dob = `${year}-${month}-${day}`;

    const result = await pool.query(
      `INSERT INTO accounts (
        username,
        email,
        password_hash,
        first_name,
        last_name,
        dob,
        is_admin
      )
      VALUES ($1, $2, $3, $4, $5, $6, false)
      RETURNING account_id, email`,
      [
        username,
        email,
        hash,
        firstName,
        lastName,
        dob,
      ]
    );

    res.status(201).json({
        user: {
            accountId: result.rows[0].account_id
        }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.listen(3000, () => {
  console.log('API running on port 3000');
});