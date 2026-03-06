require('dotenv').config();
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
    user: {
      accountId: user.account_id,
      email: user.email,
      username: user.username
    }
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

/* GET TRANSACTIONS BY MONTH */
app.get('/transactions/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { month } = req.query; // "2026-03"

    const result = await pool.query(
      `
      SELECT *
      FROM transactions
      WHERE account_id = $1
        AND TO_CHAR(transaction_date, 'YYYY-MM') = $2
      ORDER BY transaction_date DESC
      `,
      [accountId, month]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

/* ADD TRANSACTION */
app.post('/transactions', async (req, res) => {
  try {
    const { accountId, amount, categoryId, note, dateIso } = req.body;

    if (!accountId || !amount || !categoryId || !dateIso) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await pool.query(
      `
      INSERT INTO transactions (
        account_id,
        category_id,
        transaction_name,
        transaction_amount,
        transaction_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        accountId,
        categoryId,
        note || null,
        amount,
        dateIso
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add transaction' });
  }
});

/* DELETE TRANSACTION */
app.delete('/transactions/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    await pool.query(
      `DELETE FROM transactions WHERE transaction_id = $1`,
      [transactionId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

/* GET CATEGORIES */
app.get('/categories/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM categories
      WHERE account_id IS NULL
         OR account_id = $1
      ORDER BY category_name ASC
      `,
      [accountId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

/* ADD CATEGORY */
app.post('/categories', async (req, res) => {
  try {
    const { accountId, name, description, type } = req.body;

    if (!accountId || !name || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await pool.query(
      `
      INSERT INTO categories (
        category_name,
        category_desc,
        category_type,
        account_id
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, description || null, type, accountId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add category' });
  }
});

/* GET SUBSCRIPTIONS */
app.get('/subscriptions/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM subscriptions
      WHERE account_id = $1
        AND is_active = true
      ORDER BY subscription_name ASC
      `,
      [accountId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
});

/* ADD SUBSCRIPTION */
app.post('/subscriptions', async (req, res) => {
  try {
    const { accountId, name, amountPerMonth, startDate } = req.body;

    if (!accountId || !name || !amountPerMonth || !startDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await pool.query(
      `
      INSERT INTO subscriptions (
        account_id,
        subscription_name,
        amount_per_month,
        start_date,
        is_active
      )
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
      `,
      [
        accountId,
        name,
        amountPerMonth,
        startDate
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add subscription' });
  }
});

/* DEACTIVATE SUBSCRIPTION */
app.patch('/subscriptions/:subscriptionId/deactivate', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    await pool.query(
      `
      UPDATE subscriptions
      SET is_active = false
      WHERE subscription_id = $1
      `,
      [subscriptionId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to deactivate subscription' });
  }
});

/* DELETE SUBSCRIPTION */
app.delete('/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    await pool.query(
      `DELETE FROM subscriptions WHERE subscription_id = $1`,
      [subscriptionId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete subscription' });
  }
});

/* TOGGLE SUBSCRIPTION ACTIVE */
app.patch('/subscriptions/:subscriptionId/active', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { isActive } = req.body;

    const result = await pool.query(
      `
      UPDATE subscriptions
      SET is_active = $1
      WHERE subscription_id = $2
      RETURNING *
      `,
      [isActive, subscriptionId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
});

/* GET BUDGETS FOR AN ACCOUNT */
app.get('/budgets/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM budgets
      WHERE account_id = $1
      ORDER BY start_date DESC
      `,
      [accountId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch budgets' });
  }
});

/* ADD BUDGET */
app.post('/budgets', async (req, res) => {
  try {
    const { accountId, categoryId, limitAmount, startDate, finishDate } = req.body;

    if (!accountId || !categoryId || !limitAmount || !startDate || !finishDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await pool.query(
      `
      INSERT INTO budgets (
        account_id,
        category_id,
        limit_amount,
        start_date,
        finish_date,
        is_active,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, true, NOW())
      RETURNING *
      `,
      [accountId, categoryId, limitAmount, startDate, finishDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add budget' });
  }
});

/* DELETE BUDGET */
app.delete('/budgets/:budgetId', async (req, res) => {
  try {
    const { budgetId } = req.params;

    await pool.query(
      `DELETE FROM budgets WHERE budget_id = $1`,
      [budgetId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete budget' });
  }
});

/* TOGGLE BUDGET ACTIVE */
app.patch('/budgets/:budgetId/active', async (req, res) => {
  try {
    const { budgetId } = req.params;
    const { isActive } = req.body;

    const result = await pool.query(
      `
      UPDATE budgets
      SET is_active = $1
      WHERE budget_id = $2
      RETURNING *
      `,
      [isActive, budgetId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update budget status' });
  }
});

/* GET USER PROFILE */
app.get('/profile/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    const result = await pool.query(
      `
      SELECT
        first_name,
        last_name,
        dob,
        email,
        username
      FROM accounts
      WHERE account_id = $1
      `,
      [accountId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const row = result.rows[0];

    res.json({
      first_name: row.first_name,
      last_name: row.last_name,
      birthday: row.dob,
      email: row.email,
      username: row.username
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

/* UPDATE PROFILE */
app.post('/profile', async (req, res) => {
  try {
    const { accountId, firstName, lastName, birthday } = req.body;

    await pool.query(
      `UPDATE accounts
       SET first_name = $1,
           last_name = $2,
           dob = $3
       WHERE account_id = $4`,
      [firstName, lastName, birthday, accountId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

app.listen(3000, () => {
  console.log('API running on port 3000');
});