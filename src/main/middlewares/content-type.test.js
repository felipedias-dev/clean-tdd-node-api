const supertest = require('supertest');
const app = require('../config/app');

describe('Content-Type Middleware', () => {
  test('Should return json content-type as default', async () => {
    app.get('/test_content_type', (request, response) => {
      response.send('');
    });

    await supertest(app)
      .get('/test_content_type')
      .expect('content-type', /json/);
  });
});
