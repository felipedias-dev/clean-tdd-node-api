const supertest = require('supertest');
const app = require('./app');

describe('App Setup', () => {
  test('Should disable x-powered-by on header', async () => {
    app.get('/test_x_powered_by', (request, response) => {
      response.send('');
    });

    const testResponse = await supertest(app).get('/test_x_powered_by');

    expect(testResponse.headers['x-powered-by']).toBeUndefined();
  });
});
