// server/tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

const testUser = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'Test@1234',
  role: 'Administrator'
};

// ── Registration ───────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  it('registers a new user and returns tokens', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.role).toBe('Administrator');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, password: '123' });
    expect(res.status).toBe(400);
  });

  it('auto-generates borrowerId', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.body.data.user.borrowerId).toMatch(/^BRW-\d{4}$/);
  });
});

// ── Login ──────────────────────────────────────────────────
describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.com', password: testUser.password });
    expect(res.status).toBe(401);
  });
});

// ── Token Refresh ──────────────────────────────────────────
describe('POST /api/v1/auth/refresh', () => {
  let refreshToken;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    refreshToken = res.body.data.refreshToken;
  });

  it('returns new access token with valid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('rejects missing refresh token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({});
    expect(res.status).toBe(401);
  });

  it('rejects invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'bad.token.here' });
    expect(res.status).toBe(401);
  });
});

// ── Get Current User ───────────────────────────────────────
describe('GET /api/v1/auth/me', () => {
  let accessToken;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    accessToken = res.body.data.accessToken;
  });

  it('returns current user with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('rejects request without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects expired/invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});

// ── Role Check Middleware ──────────────────────────────────
describe('Role-based access control', () => {
  let adminToken, researcherToken;

  beforeEach(async () => {
    const adminRes = await request(app).post('/api/v1/auth/register').send(testUser);
    adminToken = adminRes.body.data.accessToken;

    const researcherRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Student',
      email: 'student@test.com',
      password: 'Test@1234',
      role: 'Researcher'
    });
    researcherToken = researcherRes.body.data.accessToken;
  });

  it('allows admin to access admin-only routes', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).not.toBe(403);
  });

  it('blocks researcher from admin-only routes', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${researcherToken}`);
    expect(res.status).toBe(403);
  });
});
