const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const userAuthRoutes = require('./routes/userAuthRoute');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/auth', userAuthRoutes);
app.use('/api/user', userRoutes);

module.exports = app;