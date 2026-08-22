const request = require('supertest');
const app = require('../app');
const pool = require('../db');

jest.mock('../db', () => ({
    query: jest.fn(),
}));

describe('PATCH /api/feedbacks/:id/upvote', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should increase upvotes with status 200', async () => {
        const updatedFeedback = {
            id: 1,
            company: 'X',
            badge_letter: 'X',
            text: 'Test feedback',
            upvotes: 6,
        };

        pool.query.mockResolvedValue({
            rows: [updatedFeedback],
        });

        const response = await request(app)
            .patch('/api/feedbacks/1/upvote')
            .expect(200);

        expect(response.body).toEqual(updatedFeedback);

        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE feedbacks SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *',
            ['1']
        );
    });

    it('should return 404 when feedback is not found', async () => {
        pool.query.mockResolvedValue({
            rows: [],
        });

        const response = await request(app)
            .patch('/api/feedbacks/999/upvote')
            .expect(404);

        expect(response.body).toEqual({
            error: 'Feedback not found',
        });
    });

    it('should return 500 when database update fails', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .patch('/api/feedbacks/1/upvote')
            .expect(500);

        expect(response.body).toEqual({
            error: 'Server error',
        });
    });
});