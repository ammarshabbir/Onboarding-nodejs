
const express = require('express');
const app = express();

const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/auth', userRoutes);

module.exports = app;