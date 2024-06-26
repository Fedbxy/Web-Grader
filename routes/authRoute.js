const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');

const { registerUser, loginUser, secretKey } = require('../services/authService');

const router = express.Router();

router.get('/', (req, res) => {
    const token = req.cookies.authToken;
    if (token) {
        try {
            jwt.verify(token, secretKey);
        } catch (err) {
            return res.redirect('/logout');
        }
    }

    res.render('index');
});

router.get('/submission', (req, res) => {
    const token = req.cookies.authToken;
    if (token) {
        try {
            jwt.verify(token, secretKey);
        } catch (err) {
            return res.redirect('/logout');
        }
    }

    res.render('submission');
});

router.post('/register', async (req, res) => {
    try {
        await registerUser(req.body);
        res.status(201).json({ message: 'Registration successful', success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { token, userID, displayName, username } = await loginUser(req.body);

        res.cookie('authToken', token, { httpOnly: true, sameSite: 'strict', secure: true });
        res.cookie('isLoggedIn', true);

        res.json({ message: 'Login successful', user: { userID, displayName, username }, success: true });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.cookie('isLoggedIn', false);
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    if (req.cookies.authToken && req.cookies.authToken !== 'undefined') {
        res.redirect('/login');
    } else {
        res.render('login');
    }
});

router.get('/register', (req, res) => {
    if (req.cookies.authToken) {
        res.redirect('/');
    } else {
        res.render('register');
    }
});

module.exports = router;