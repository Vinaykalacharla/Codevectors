const express = require('express');
const cors = require('cors');
const path = require('path');
const { query } = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/products', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const { category, cursor } = req.query;

    let cursorData = null;
    if (cursor) {
      cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
    }

    const conditions = [];
    const params = [];
    let idx = 1;

    if (category) {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }

    // This guarantees no duplicates or missing items when new rows are inserted
    if (cursorData) {
      conditions.push(`(created_at, id) < ($${idx++}, $${idx++})`);
      params.push(cursorData.created_at, cursorData.id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // sorting by created_at DESC, id DESC ensures completely stable pagination
    const sql = `
      SELECT id, name, category, price, created_at 
      FROM products 
      ${where} 
      ORDER BY created_at DESC, id DESC 
      LIMIT $${idx}
    `;
    params.push(limit);

    const { rows } = await query(sql, params);

    let next = null;
    if (rows.length === limit) {
      const last = rows[rows.length - 1];
      next = Buffer.from(JSON.stringify({
        created_at: last.created_at,
        id: last.id
      })).toString('base64');
    }

    res.json({ products: rows, nextCursor: next });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/products/count', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = `SELECT COUNT(*) as total FROM products`;
    const params = [];
    if (category) {
      sql += ` WHERE category = $1`;
      params.push(category);
    }
    const { rows } = await query(sql, params);
    res.json({ total: parseInt(rows[0].total, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await query(`SELECT DISTINCT category FROM products`);
    res.json(rows.map(r => r.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
