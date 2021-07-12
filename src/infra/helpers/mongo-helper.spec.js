const MongoHelper = require('./mongo-helper');

describe('Mongo Helper', () => {
  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  test('Should reconnect when getDb() is called and connection is down', async () => {
    const sut = MongoHelper;

    await sut.connect(process.env.MONGO_URL);
    expect(sut.db).toBeTruthy();

    await sut.disconnect();
    expect(sut.db).toBeFalsy();

    const db = await sut.getDb();
    expect(db).toBeTruthy();
  });
});
