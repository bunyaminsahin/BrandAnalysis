const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BrandAnalysis API',
      version: '1.0.0',
      description: ' REST API for the BrandAnalysis feedback platform',
    },
    servers: [
      {
        url: 'http://localhost:3007',
        description: 'Local Server',
      },
      {
        url: 'https://brandanalysis-l2hj.onrender.com',
        description: 'Production Server',
      },
    ],
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;