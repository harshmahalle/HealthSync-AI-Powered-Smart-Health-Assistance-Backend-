const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const allowedOrigins = ['https://healthsync-bkju.onrender.com']; 
require('dotenv').config();

const app = express();
const port = 3306;

// Enable CORS to allow requests from frontend
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
  
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Register route
app.post('/signup', (req, res) => {
    const { fullName, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query('INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)',
        [fullName, email, hashedPassword],
        (err, result) => {
            if (err) {
                return res.status(400).json({ message: 'Error creating user' });
            }
            res.status(201).json({ message: 'User created successfully' });
        });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            if (bcrypt.compareSync(password, user.password)) {
                res.json({ message: 'Login successful', user: { fullName: user.fullName, email: user.email } });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Heatlh is fine');
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
