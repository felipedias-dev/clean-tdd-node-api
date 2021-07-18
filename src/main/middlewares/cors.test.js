const supertest = require('supertest');
const app = require('../config/app');

describe('CORS Middleware', () => {
  test('Should enable CORS', async () => {
    app.get('/test_cors', (request, response) => {
      response.send('');
    });

    const testResponse = await supertest(app).get('/test_cors');

    expect(testResponse.headers['access-control-allow-origin']).toBe('*');
    expect(testResponse.headers['access-control-allow-methods']).toBe('*');
    expect(testResponse.headers['access-control-allow-headers']).toBe('*');
  });
});
