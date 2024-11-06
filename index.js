const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const User = require('./models/User'); 
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3300;

// CORS configuration
const allowedOrigins = [
  'https://health-sync.netlify.app',
  'https://healthsync-bkju.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB database.');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Register route
app.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = new User({
        fullName,
        email,
        password: hashedPassword
    });

    try {
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Error creating user', error: err.message });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            res.json({ message: 'Login successful', user: { fullName: user.fullName, email: user.email } });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Root Endpoint
app.get('/', (req, res) => {
    res.send('My Health is fine');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


