import request from 'supertest';
import { createApp } from '../app.js';
import { connectTestDB, clearTestDB, disconnectTestDB } from './setup.js';

const app = createApp();

describe('Auth Routes — Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  // ─────────────────────────────────────────────
  // POST /api/v1/auth/register
  // ─────────────────────────────────────────────
  describe('POST /api/v1/auth/register', () => {
    it('should return 201 and user info on valid input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'DJ Alice',
          email: 'alice@dj.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        name: 'DJ Alice',
        email: 'alice@dj.com',
        role: 'user',
      });
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return 409 when email is already registered', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'DJ Alice',
          email: 'alice@dj.com',
          password: 'Password123!',
        });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'DJ Alice 2',
          email: 'alice@dj.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.message || res.body.error).toContain('El email ya está registrado');
    });

    it('should return 400 or 422 on invalid input schema (Zod)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'A',
          email: 'invalid-email',
          password: '123',
        });

      expect([400, 422]).toContain(res.status);
    });
  });

  // ─────────────────────────────────────────────
  // POST /api/v1/auth/login
  // ─────────────────────────────────────────────
  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'DJ Alice',
          email: 'alice@dj.com',
          password: 'Password123!',
        });
    });

    it('should return 200 and accessToken on valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@dj.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(typeof res.body.data.accessToken).toBe('string');
    });

    it('should return 401 on wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@dj.com',
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.message || res.body.error).toContain('Credenciales inválidas');
    });
  });

  // ─────────────────────────────────────────────
  // GET /api/v1/auth/me
  // ─────────────────────────────────────────────
  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'DJ Alice',
          email: 'alice@dj.com',
          password: 'Password123!',
        });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@dj.com',
          password: 'Password123!',
        });

      accessToken = loginRes.body.data.accessToken;
    });

    it('should return 200 and user info with valid token in Authorization header', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('alice@dj.com');
    });

    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token format', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // POST /api/v1/auth/refresh
  // ─────────────────────────────────────────────
  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh tokens when valid refreshToken cookie is sent', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'DJ Alice',
          email: 'alice@dj.com',
          password: 'Password123!',
        });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@dj.com',
          password: 'Password123!',
        });

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Tokens renovados exitosamente');
    });

    it('should return 401 when refreshToken cookie is missing', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');

      expect(res.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // POST /api/v1/auth/logout
  // ─────────────────────────────────────────────
  describe('POST /api/v1/auth/logout', () => {
    it('should return 200 and clear cookies on logout', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'DJ Alice',
          email: 'alice@dj.com',
          password: 'Password123!',
        });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alice@dj.com',
          password: 'Password123!',
        });

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Sesión cerrada exitosamente');
    });
  });
});
