const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// 1. Feedback'leri Getir (Filtreli veya Tümünü)
app.get('/api/feedbacks', async (req, res) => {
    try {
        const { company } = req.query;
        let query = 'SELECT * FROM feedbacks';
        let params = [];

        if (company) {
            query += ' WHERE LOWER(company) = LOWER($1)';
            params.push(company);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. Yeni Feedback Ekle
app.post('/api/feedbacks', async (req, res) => {
    try {
        const { company, badgeLetter, text } = req.body;

        if (!company || !badgeLetter || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newFeedback = await pool.query(
            'INSERT INTO feedbacks (company, badge_letter, text) VALUES ($1, $2, $3) RETURNING *',
            [company, badgeLetter, text]
        );

        res.status(201).json(newFeedback.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. Upvote Artır
app.patch('/api/feedbacks/:id/upvote', async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await pool.query(
            'UPDATE feedbacks SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *',
            [id]
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});