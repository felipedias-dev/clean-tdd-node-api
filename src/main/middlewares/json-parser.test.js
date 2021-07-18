const supertest = require('supertest');
const app = require('../config/app');

describe('JSON Parser Middleware', () => {
  test('Should parse body as JSON', async () => {
    app.post('/test_json_parser', (request, response) => {
      response.send(request.body);
    });

    await supertest(app)
      .post('/test_json_parser')
      .send({ name: 'test' })
      .expect({ name: 'test' });
  });
});
