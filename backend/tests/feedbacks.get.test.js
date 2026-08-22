const request = require('supertest');
const app = require('../app');
const pool = require('../db');

jest.mock('../db', () => ({
    query: jest.fn(),
}));

describe('GET /api/feedbacks', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return all feedbacks with status 200', async () => {
        const mockFeedbacks = [
            {
                id: 1,
                company: 'X',
                badge_letter: 'X',
                text: 'First test feedback',
                upvotes: 5,
            },
            {
                id: 2,
                company: 'Y',
                badge_letter: 'Y',
                text: 'Second test feedback',
                upvotes: 3,
            },
        ];

        pool.query.mockResolvedValue({
            rows: mockFeedbacks,
        });

        const response = await request(app)
            .get('/api/feedbacks')
            .expect(200);

        expect(response.body).toEqual(mockFeedbacks);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should filter feedbacks by company', async () => {
        const mockFeedbacks = [
            {
                id: 1,
                company: 'X',
                badge_letter: 'X',
                text: 'Test feedback',
                upvotes: 5,
            },
        ];

        pool.query.mockResolvedValue({
            rows: mockFeedbacks,
        });

        const response = await request(app)
            .get('/api/feedbacks?company=X')
            .expect(200);

        expect(response.body).toEqual(mockFeedbacks);

        expect(pool.query).toHaveBeenCalledWith(
            'SELECT * FROM feedbacks WHERE LOWER(company) = LOWER($1) ORDER BY created_at DESC',
            ['X']
        );
    });

    it('should return status 500 when database query fails', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .get('/api/feedbacks')
            .expect(500);

        expect(response.body).toEqual({
            error: 'Server error',
        });
    });
});