const { MongoClient } = require('mongodb');

module.exports = {
  async connect(uri) {
    this.uri = uri;
    this.connection = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.db = this.connection.db();
  },

  async disconnect() {
    await this.connection.close();
    this.db = null;
  },

  async getCollection(name) {
    if (!this.connection || !this.connection.isConnected()) {
      await this.connect(this.uri);
    }

    return this.db.collection(name);
  },
};
