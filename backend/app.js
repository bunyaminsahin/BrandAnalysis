const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');   

const app = express();

app.use(cors());
app.use(express.json());

// Swagger Arayüzü
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         company:
 *           type: string
 *           example: "Google"
 *         badge_letter:
 *           type: string
 *           example: "G"
 *         text:
 *           type: string
 *           example: "Harika bir çalışma ortamı."
 *         upvotes:
 *           type: integer
 *           example: 5
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2026-08-28T20:00:00.000Z"
 */

/**
 * @swagger
 * /api/feedbacks:
 *   get:
 *     summary: Feedback'leri getir (Filtreli veya tümü)
 *     tags: [Feedbacks]
 *     parameters:
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         required: false
 *         description: Şirket adına göre filtreleme yapar
 *     responses:
 *       200:
 *         description: Feedback listesi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       500:
 *         description: Sunucu hatası
 */
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

/**
 * @swagger
 * /api/feedbacks:
 *   post:
 *     summary: Yeni bir feedback ekle
 *     tags: [Feedbacks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company
 *               - badgeLetter
 *               - text
 *             properties:
 *               company:
 *                 type: string
 *                 example: "Apple"
 *               badgeLetter:
 *                 type: string
 *                 example: "A"
 *               text:
 *                 type: string
 *                 example: "Kullanıcı deneyimi çok başarılı."
 *     responses:
 *       201:
 *         description: Feedback başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Eksik alanlar var
 *       500:
 *         description: Sunucu hatası
 */
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

/**
 * @swagger
 * /api/feedbacks/{id}/upvote:
 *   patch:
 *     summary: Feedback upvote sayısını 1 artır
 *     tags: [Feedbacks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Upvote edilecek feedback ID'si
 *     responses:
 *       200:
 *         description: Upvote işlemi başarılı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       404:
 *         description: Feedback bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
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

module.exports = app;