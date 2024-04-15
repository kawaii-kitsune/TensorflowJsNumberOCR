// routes/index.js
const express = require('express');
const router = express.Router();
const models = require('../tensorflow/models');
const path = require('path');
// Define routes
router.get('/', (req, res) => {
    res.sendFile(path.resolve('./views/index.html'));
});

router.get('/about', (req, res) => {
    res.sendFile(path.resolve('./views/about.html'));
});
router.get('/contact', (req, res) => {
    res.sendFile(path.resolve('./views/contact.html'));
});


module.exports = router;
