const request = require('supertest');
const app = require('../app');
const pool = require('../db');

jest.mock('../db', () => ({
    query: jest.fn(),
}));

describe('POST /api/feedbacks', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new feedback with status 201', async () => {
        const newFeedback = {
            id: 3,
            company: 'Z',
            badge_letter: 'Z',
            text: 'New test feedback',
            upvotes: 0,
        };

        pool.query.mockResolvedValue({
            rows: [newFeedback],
        });

        const response = await request(app)
            .post('/api/feedbacks')
            .send({
                company: 'Z',
                badgeLetter: 'Z',
                text: 'New test feedback',
            })
            .expect(201);

        expect(response.body).toEqual(newFeedback);

        expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO feedbacks (company, badge_letter, text) VALUES ($1, $2, $3) RETURNING *',
            ['Z', 'Z', 'New test feedback']
        );
    });

    it('should return 400 when required fields are missing', async () => {
        const response = await request(app)
            .post('/api/feedbacks')
            .send({
                company: 'Z',
            })
            .expect(400);

        expect(response.body).toEqual({
            error: 'Missing required fields',
        });

        expect(pool.query).not.toHaveBeenCalled();
    });

    it('should return 500 when database insert fails', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/api/feedbacks')
            .send({
                company: 'Z',
                badgeLetter: 'Z',
                text: 'Test feedback',
            })
            .expect(500);

        expect(response.body).toEqual({
            error: 'Server error',
        });
    });
});