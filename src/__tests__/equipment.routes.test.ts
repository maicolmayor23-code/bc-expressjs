import request from 'supertest';
import { createApp } from '../app.js';
import { connectTestDB, clearTestDB, disconnectTestDB } from './setup.js';
import { Category } from '../models/category.model.js';
import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';

const app = createApp();

describe('Equipment Routes — Integration Tests (Dominio DJ / Sonido y Luces)', () => {
  let userToken: string;
  let adminToken: string;
  let categoryId: string;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  // Helper para preparar usuario 'user', usuario 'admin' y una categoría de prueba
  async function setupAuthAndCategory() {
    // 1. Crear categoría
    const category = await Category.create({
      name: 'Equipos DJ & Mezcadores',
      description: 'Controladoras, tornamesas y mezcladoras profesionales',
    });
    categoryId = category._id.toString();

    // 2. Crear usuario estándar
    const hashedUserPassword = await bcrypt.hash('Password123!', 1);
    await User.create({
      name: 'DJ User',
      email: 'user@dj.com',
      password: hashedUserPassword,
      role: 'user',
    });

    // 3. Crear usuario administrador
    const hashedAdminPassword = await bcrypt.hash('AdminPassword123!', 1);
    await User.create({
      name: 'DJ Admin',
      email: 'admin@dj.com',
      password: hashedAdminPassword,
      role: 'admin',
    });

    // 4. Loguear usuarios para obtener JWT Access Tokens
    const userLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@dj.com', password: 'Password123!' });
    userToken = userLoginRes.body.data.accessToken;

    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@dj.com', password: 'AdminPassword123!' });
    adminToken = adminLoginRes.body.data.accessToken;
  }

  // ─────────────────────────────────────────────
  // GET /api/v1/equipment
  // ─────────────────────────────────────────────
  describe('GET /api/v1/equipment', () => {
    it('should return 200 and paginated structure with empty array initially', async () => {
      await setupAuthAndCategory();

      const res = await request(app)
        .get('/api/v1/equipment')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const items = res.body.data || res.body.items || res.body;
      expect(Array.isArray(items.data || items)).toBe(true);
    });

    it('should return 401 when request is made without Authorization token', async () => {
      const res = await request(app).get('/api/v1/equipment');

      expect(res.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // POST /api/v1/equipment
  // ─────────────────────────────────────────────
  describe('POST /api/v1/equipment', () => {
    it('should return 201 and created equipment with valid data and auth token', async () => {
      await setupAuthAndCategory();

      const equipmentData = {
        name: 'Controladora Pioneer DDJ-1000',
        serialNumber: 'SN-DDJ1000-2026',
        brand: 'Pioneer DJ',
        dailyRate: 85,
        category: categoryId,
      };

      const res = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${userToken}`)
        .send(equipmentData);

      expect(res.status).toBe(201);
      const createdObj = res.body.data || res.body;
      expect(createdObj).toMatchObject({
        name: 'Controladora Pioneer DDJ-1000',
        serialNumber: 'SN-DDJ1000-2026',
        brand: 'Pioneer DJ',
        dailyRate: 85,
      });
      expect(createdObj._id).toBeDefined();
    });

    it('should return 400 or 422 with invalid payload data (Zod Validation Failure)', async () => {
      await setupAuthAndCategory();

      const invalidData = {
        name: '', // Nombre vacío
        serialNumber: '',
        brand: 'Pioneer',
        dailyRate: -50, // Tarifa negativa inválida
        category: 'invalid-object-id', // ID inválido
      };

      const res = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData);

      expect([400, 422]).toContain(res.status);
    });

    it('should return 401 when posting equipment without auth token', async () => {
      await setupAuthAndCategory();

      const equipmentData = {
        name: 'Controladora Pioneer DDJ-1000',
        serialNumber: 'SN-DDJ1000-2026',
        brand: 'Pioneer DJ',
        dailyRate: 85,
        category: categoryId,
      };

      const res = await request(app)
        .post('/api/v1/equipment')
        .send(equipmentData);

      expect(res.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────
  // GET /api/v1/equipment/:id
  // ─────────────────────────────────────────────
  describe('GET /api/v1/equipment/:id', () => {
    it('should return 200 and equipment data when valid ID exists', async () => {
      await setupAuthAndCategory();

      const createRes = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Luces Robóticas Beam 230W',
          serialNumber: 'SN-BEAM230-01',
          brand: 'Chauvet DJ',
          dailyRate: 120,
          category: categoryId,
        });

      const eq = createRes.body.data || createRes.body;
      const equipmentId = eq._id;

      const res = await request(app)
        .get(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const getObj = res.body.data || res.body;
      expect(getObj.name).toBe('Luces Robóticas Beam 230W');
    });

    it('should return 404 when querying non-existent equipment ObjectId', async () => {
      await setupAuthAndCategory();

      const nonExistentId = '507f1f77bcf86cd799439011';

      const res = await request(app)
        .get(`/api/v1/equipment/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message || res.body.error).toContain('Equipo no encontrado');
    });
  });

  // ─────────────────────────────────────────────
  // PUT /api/v1/equipment/:id
  // ─────────────────────────────────────────────
  describe('PUT /api/v1/equipment/:id', () => {
    it('should return 200 and updated equipment when valid data is provided', async () => {
      await setupAuthAndCategory();

      const createRes = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Sistema de Sonido Line Array 5000W',
          serialNumber: 'SN-ARRAY5K-01',
          brand: 'DAS Audio',
          dailyRate: 350,
          category: categoryId,
        });

      const eq = createRes.body.data || createRes.body;
      const equipmentId = eq._id;

      const res = await request(app)
        .put(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          dailyRate: 400,
          isAvailable: false,
        });

      expect(res.status).toBe(200);
      const updatedObj = res.body.data || res.body;
      expect(updatedObj.dailyRate).toBe(400);
      expect(updatedObj.isAvailable).toBe(false);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /api/v1/equipment/:id
  // ─────────────────────────────────────────────
  describe('DELETE /api/v1/equipment/:id', () => {
    it('should return 200 or 204 when deleted by an admin user', async () => {
      await setupAuthAndCategory();

      const createRes = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Máquina de Humo Bajo DMX',
          serialNumber: 'SN-FOGDMX-99',
          brand: 'Antari',
          dailyRate: 60,
          category: categoryId,
        });

      const eq = createRes.body.data || createRes.body;
      const equipmentId = eq._id;

      const res = await request(app)
        .delete(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 204]).toContain(res.status);

      // Verificar que efectivamente fue eliminado
      const getRes = await request(app)
        .get(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });

    it('should return 403 Forbidden when a standard user (non-admin) tries to delete', async () => {
      await setupAuthAndCategory();

      const createRes = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Consola Digital Behringer X32',
          serialNumber: 'SN-X32-CONSOLE-01',
          brand: 'Behringer',
          dailyRate: 250,
          category: categoryId,
        });

      const eq = createRes.body.data || createRes.body;
      const equipmentId = eq._id;

      const res = await request(app)
        .delete(`/api/v1/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message || res.body.error).toContain('No autorizado');
    });
  });
});
