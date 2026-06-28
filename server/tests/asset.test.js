// server/tests/asset.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const app = require('../app');

let mongoServer, adminToken, researcherToken, assetId;

const admin = { name: 'Admin', email: 'admin@test.com', password: 'Test@1234', role: 'Administrator' };
const researcher = { name: 'Researcher', email: 'res@test.com', password: 'Test@1234', role: 'Researcher' };

const assetPayload = {
  name: 'Arduino Uno R3',
  category: 'Electronics',
  description: 'ATmega328P microcontroller',
  quantityTotal: 10,
  quantityAvailable: 10,
  status: 'Available',
  purchaseCost: 23.5,
  vendor: JSON.stringify({ name: 'Robu.in', contact: 'sales@robu.in' }),
  warranty: JSON.stringify({ period: '1 year' })
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const r1 = await request(app).post('/api/v1/auth/register').send(admin);
  adminToken = r1.body.data.accessToken;

  const r2 = await request(app).post('/api/v1/auth/register').send(researcher);
  researcherToken = r2.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await mongoose.connection.collection('assets').deleteMany({});
});

// helper — create one asset as admin
const createAsset = () =>
  request(app)
    .post('/api/v1/assets')
    .set('Authorization', `Bearer ${adminToken}`)
    .field('name', assetPayload.name)
    .field('category', assetPayload.category)
    .field('description', assetPayload.description)
    .field('quantityTotal', assetPayload.quantityTotal)
    .field('quantityAvailable', assetPayload.quantityAvailable)
    .field('status', assetPayload.status)
    .field('purchaseCost', assetPayload.purchaseCost)
    .field('vendor', assetPayload.vendor)
    .field('warranty', assetPayload.warranty);

// ── GET /assets ────────────────────────────────────────────
describe('GET /api/v1/assets', () => {
  it('returns paginated asset list', async () => {
    await createAsset();
    const res = await request(app)
      .get('/api/v1/assets')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('assets');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('page');
    expect(res.body.data).toHaveProperty('pages');
  });

  it('filters by category', async () => {
    await createAsset();
    const res = await request(app)
      .get('/api/v1/assets?category=Electronics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.assets.every(a => a.category === 'Electronics')).toBe(true);
  });

  it('filters by search keyword', async () => {
    await createAsset();
    const res = await request(app)
      .get('/api/v1/assets?search=Arduino')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(1);
  });

  it('filters availability=available', async () => {
    await createAsset();
    const res = await request(app)
      .get('/api/v1/assets?availability=available')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.assets.every(a => a.quantityAvailable > 0)).toBe(true);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/assets');
    expect(res.status).toBe(401);
  });
});

// ── GET /assets/categories ─────────────────────────────────
describe('GET /api/v1/assets/categories', () => {
  it('returns sorted unique categories', async () => {
    await createAsset();
    const res = await request(app)
      .get('/api/v1/assets/categories')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
    expect(res.body.data.categories).toContain('Electronics');
  });
});

// ── POST /assets ───────────────────────────────────────────
describe('POST /api/v1/assets', () => {
  it('admin creates asset with auto-generated assetCode', async () => {
    const res = await createAsset();
    expect(res.status).toBe(201);
    expect(res.body.data.asset.assetCode).toMatch(/^AST-\d{4}$/);
    expect(res.body.data.asset.name).toBe('Arduino Uno R3');
    expect(res.body.data.asset.vendor.name).toBe('Robu.in');
  });

  it('rejects creation by Researcher', async () => {
    const res = await request(app)
      .post('/api/v1/assets')
      .set('Authorization', `Bearer ${researcherToken}`)
      .field('name', 'Test Asset')
      .field('category', 'Electronics')
      .field('quantityTotal', 1);
    expect(res.status).toBe(403);
  });

  it('defaults quantityAvailable to quantityTotal', async () => {
    const res = await request(app)
      .post('/api/v1/assets')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Test Asset')
      .field('category', 'Electronics')
      .field('quantityTotal', 5);
    expect(res.status).toBe(201);
    expect(res.body.data.asset.quantityAvailable).toBe(5);
  });
});

// ── GET /assets/:id ────────────────────────────────────────
describe('GET /api/v1/assets/:id', () => {
  it('returns single asset', async () => {
    const created = await createAsset();
    const id = created.body.data.asset._id;
    const res = await request(app)
      .get(`/api/v1/assets/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.asset._id).toBe(id);
  });

  it('returns 404 for unknown id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/v1/assets/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

// ── PUT /assets/:id ────────────────────────────────────────
describe('PUT /api/v1/assets/:id', () => {
  it('admin updates asset fields', async () => {
    const created = await createAsset();
    const id = created.body.data.asset._id;
    const res = await request(app)
      .put(`/api/v1/assets/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('status', 'UnderMaintenance')
      .field('quantityAvailable', 5);
    expect(res.status).toBe(200);
    expect(res.body.data.asset.status).toBe('UnderMaintenance');
    expect(res.body.data.asset.quantityAvailable).toBe(5);
  });

  it('blocks Researcher from updating', async () => {
    const created = await createAsset();
    const id = created.body.data.asset._id;
    const res = await request(app)
      .put(`/api/v1/assets/${id}`)
      .set('Authorization', `Bearer ${researcherToken}`)
      .field('status', 'Retired');
    expect(res.status).toBe(403);
  });
});

// ── DELETE /assets/:id ─────────────────────────────────────
describe('DELETE /api/v1/assets/:id', () => {
  it('admin deletes asset', async () => {
    const created = await createAsset();
    const id = created.body.data.asset._id;
    const res = await request(app)
      .delete(`/api/v1/assets/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });

  it('returns 404 for already-deleted asset', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/v1/assets/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('blocks Researcher from deleting', async () => {
    const created = await createAsset();
    const id = created.body.data.asset._id;
    const res = await request(app)
      .delete(`/api/v1/assets/${id}`)
      .set('Authorization', `Bearer ${researcherToken}`);
    expect(res.status).toBe(403);
  });
});
