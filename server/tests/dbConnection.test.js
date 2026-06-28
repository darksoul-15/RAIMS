// server/tests/dbConnection.test.js — verifies MongoDB Atlas connection
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('MongoDB Connection', () => {
  it('connects successfully', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('can write and read a document', async () => {
    const TestModel = mongoose.model('TestDoc', new mongoose.Schema({ val: String }));
    const doc = await TestModel.create({ val: 'raims-ok' });
    const found = await TestModel.findById(doc._id);
    expect(found.val).toBe('raims-ok');
    await mongoose.connection.dropCollection('testdocs');
  });
});
