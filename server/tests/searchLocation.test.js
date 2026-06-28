// server/tests/searchLocation.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Location = require('../models/Location');
const Asset = require('../models/Asset');

let mongoServer, token, locationId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  const r = await request(app).post('/api/v1/auth/register').send(
    { name: 'Admin', email: 'admin@test.com', password: 'Test@1234', role: 'Administrator' }
  );
  token = r.body.data.accessToken;

  const loc = await Location.create({ name: 'Electronics Lab', type: 'Lab' });
  locationId = loc._id;

  await Asset.create([
    { assetCode: 'AST-0001', name: 'Arduino Uno', category: 'Electronics', quantityTotal: 10, quantityAvailable: 8, status: 'Available', storageLocation: locationId },
    { assetCode: 'AST-0002', name: 'Raspberry Pi', category: 'Computing', quantityTotal: 5, quantityAvailable: 1, status: 'Available', storageLocation: locationId },
    { assetCode: 'AST-0003', name: 'Servo Motor', category: 'Robotics', quantityTotal: 20, quantityAvailable: 0, status: 'Borrowed', storageLocation: locationId }
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

// ── Module 2: Search ───────────────────────────────────────
describe('Search & Discovery (GET /api/v1/assets)', () => {
  it('keyword search returns matching assets', async () => {
    const res = await request(app).get('/api/v1/assets?search=Arduino').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.assets[0].name).toBe('Arduino Uno');
  });

  it('category filter narrows results', async () => {
    const res = await request(app).get('/api/v1/assets?category=Computing').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.assets.every(a => a.category === 'Computing')).toBe(true);
  });

  it('status filter works', async () => {
    const res = await request(app).get('/api/v1/assets?status=Borrowed').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.assets.every(a => a.status === 'Borrowed')).toBe(true);
  });

  it('availability=available excludes zero-stock items', async () => {
    const res = await request(app).get('/api/v1/assets?availability=available').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.assets.every(a => a.quantityAvailable > 0)).toBe(true);
    expect(res.body.data.assets.find(a => a.name === 'Servo Motor')).toBeUndefined();
  });

  it('pagination returns correct page shape', async () => {
    const res = await request(app).get('/api/v1/assets?page=1&limit=2').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.assets.length).toBeLessThanOrEqual(2);
    expect(res.body.data).toHaveProperty('pages');
  });

  it('empty search returns all assets', async () => {
    const res = await request(app).get('/api/v1/assets').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(3);
  });
});

// ── Module 5: Locations ────────────────────────────────────
describe('Locations (GET /api/v1/locations)', () => {
  it('returns all locations', async () => {
    const res = await request(app).get('/api/v1/locations').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.locations.length).toBeGreaterThan(0);
  });

  it('summaries include assetCount and categories', async () => {
    const res = await request(app).get('/api/v1/locations/summaries').set(auth());
    expect(res.status).toBe(200);
    const loc = res.body.data.locations.find(l => l.name === 'Electronics Lab');
    expect(loc.assetCount).toBe(3);
    expect(loc.totalItems).toBe(35);
    expect(loc.availableItems).toBe(9);
    expect(Array.isArray(loc.categories)).toBe(true);
  });

  it('location with assets returns embedded asset list', async () => {
    const res = await request(app).get(`/api/v1/locations/${locationId}/assets`).set(auth());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.location.assets)).toBe(true);
    expect(res.body.data.location.assets.length).toBe(3);
  });

  it('returns 404 for unknown location', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/locations/${fakeId}/assets`).set(auth());
    expect(res.status).toBe(404);
  });
});

// ── Module 7: Reuse Recommendations ───────────────────────
describe('Reuse Suggestions (GET /api/v1/assets/reuse)', () => {
  it('returns underutilized assets (≥60% idle)', async () => {
    const res = await request(app).get('/api/v1/assets/reuse').set(auth());
    expect(res.status).toBe(200);
    const { suggestions } = res.body.data;
    // Arduino (8/10 = 80% idle), Raspberry Pi (1/5 = 20% idle — excluded)
    expect(suggestions.find(s => s.name === 'Arduino Uno')).toBeDefined();
    expect(suggestions.find(s => s.name === 'Raspberry Pi')).toBeUndefined();
  });

  it('excludes borrowed/zero-stock assets', async () => {
    const res = await request(app).get('/api/v1/assets/reuse').set(auth());
    expect(res.body.data.suggestions.find(s => s.name === 'Servo Motor')).toBeUndefined();
  });

  it('includes utilizationPct in response', async () => {
    const res = await request(app).get('/api/v1/assets/reuse').set(auth());
    const arduino = res.body.data.suggestions.find(s => s.name === 'Arduino Uno');
    expect(arduino).toHaveProperty('utilizationPct');
    expect(arduino.utilizationPct).toBe(20); // 2/10 borrowed = 20% utilized
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/v1/assets/reuse?category=Electronics').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.data.suggestions.every(s => s.category === 'Electronics')).toBe(true);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/assets/reuse');
    expect(res.status).toBe(401);
  });
});
