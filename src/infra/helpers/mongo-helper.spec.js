const sut = require('./mongo-helper');

describe('Mongo Helper', () => {
  beforeAll(async () => {
    await sut.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await sut.disconnect();
  });

  test('Should reconnect when getCollection is called and connection is down', async () => {
    expect(sut.db).toBeTruthy();

    await sut.disconnect();
    expect(sut.db).toBeFalsy();

    await sut.getCollection('a');
    expect(sut.db).toBeTruthy();
  });
});
