const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mysupersecretjwtkey2024';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://bookshop:bookshop123@localhost:5432/bookshop'
});

app.use(cors());
app.use(express.json());

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, role',
      [email, hashedPassword, name]
    );
    
    const token = jwt.sign({ id: result.rows[0].id, email, role: result.rows[0].role }, JWT_SECRET);
    res.json({ user: result.rows[0], token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ 
      user: { id: user.id, email: user.email, name: user.name, role: user.role }, 
      token 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Books routes
app.get('/api/books', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM books';
    const params = [];
    
    if (category && category !== 'All') {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    if (search) {
      query += params.length > 0 ? ' AND' : ' WHERE';
      query += ' (title ILIKE $' + (params.length + 1) + ' OR author ILIKE $' + (params.length + 1) + ')';
      params.push('%' + search + '%');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { title, author, description, price, image_url, category, stock } = req.body;
    const result = await pool.query(
      'INSERT INTO books (title, author, description, price, image_url, category, stock) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, author, description, price, image_url, category, stock]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/books/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const { title, author, description, price, image_url, category, stock } = req.body;
    const result = await pool.query(
      'UPDATE books SET title = $1, author = $2, description = $3, price = $4, image_url = $5, category = $6, stock = $7 WHERE id = $8 RETURNING *',
      [title, author, description, price, image_url, category, stock, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/books/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cart routes
app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, b.id as book_id, b.title, b.author, b.price, b.image_url
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart', authMiddleware, async (req, res) => {
  try {
    const { book_id, quantity } = req.body;
    
    // Check stock
    const bookCheck = await pool.query('SELECT stock FROM books WHERE id = $1', [book_id]);
    if (bookCheck.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND book_id = $2',
      [req.user.id, book_id]
    );
    
    if (existing.rows.length > 0) {
      const newQuantity = existing.rows[0].quantity + quantity;
      if (newQuantity > bookCheck.rows[0].stock) {
        return res.status(400).json({ error: 'Not enough stock' });
      }
      
      const result = await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
        [newQuantity, existing.rows[0].id]
      );
      res.json(result.rows[0]);
    } else {
      if (quantity > bookCheck.rows[0].stock) {
        return res.status(400).json({ error: 'Not enough stock' });
      }
      
      const result = await pool.query(
        'INSERT INTO cart_items (user_id, book_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [req.user.id, book_id, quantity]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/cart/:id', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/cart/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Removed' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Orders routes
app.post('/api/orders', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const cartItems = await client.query(
      `SELECT ci.*, b.price, b.stock FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );
    
    if (cartItems.rows.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // Check stock for all items
    for (const item of cartItems.rows) {
      if (item.quantity > item.stock) {
        throw new Error(`Not enough stock for book ID ${item.book_id}`);
      }
    }
    
    const total = cartItems.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { shipping_address } = req.body;
    
    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, total, shipping_address]
    );
    
    const orderId = orderResult.rows[0].id;
    
    for (const item of cartItems.rows) {
      await client.query(
        'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.book_id, item.quantity, item.price]
      );
      
      await client.query(
        'UPDATE books SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.book_id]
      );
    }
    
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    
    await client.query('COMMIT');
    res.json(orderResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, 
        json_agg(json_build_object(
          'id', oi.id,
          'book_id', oi.book_id,
          'quantity', oi.quantity,
          'price', oi.price,
          'book_title', b.title
        )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN books b ON oi.book_id = b.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM books ORDER BY category');
    res.json(result.rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
