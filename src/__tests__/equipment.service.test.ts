jest.mock('../repositories/equipment.repository.js');
jest.mock('../repositories/category.repository.js');

import * as equipmentService from '../services/equipment.service.js';
import * as equipmentRepo from '../repositories/equipment.repository.js';
import * as categoryRepo from '../repositories/category.repository.js';
import { AppError } from '../errors/AppError.js';

const mockEquipmentRepo = equipmentRepo as jest.Mocked<typeof equipmentRepo>;
const mockCategoryRepo = categoryRepo as jest.Mocked<typeof categoryRepo>;

describe('EquipmentService — Unit Tests (Dominio DJ / Sonido y Luces)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // getAllEquipment()
  // ─────────────────────────────────────────────
  describe('getAllEquipment', () => {
    it('should return paginated equipment list with valid page and limit', async () => {
      const mockResult = {
        data: [
          { name: 'Pioneer DDJ-FLX6 Controller', price: 699, category: 'cat-id-1' },
          { name: 'Chauvet DJ GigBAR Move', price: 1199, category: 'cat-id-2' },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockEquipmentRepo.findAll.mockResolvedValue(mockResult as any);

      const result = await equipmentService.getAllEquipment(1, 10);

      expect(mockEquipmentRepo.findAll).toHaveBeenCalledWith(1, 10);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should sanitize negative page and limit parameters to defaults', async () => {
      mockEquipmentRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 1,
        totalPages: 0,
      } as any);

      await equipmentService.getAllEquipment(-5, 0);

      expect(mockEquipmentRepo.findAll).toHaveBeenCalledWith(1, 1);
    });
  });

  // ─────────────────────────────────────────────
  // getEquipmentById()
  // ─────────────────────────────────────────────
  describe('getEquipmentById', () => {
    it('should return equipment when found by ID', async () => {
      const mockEquipment = {
        _id: 'eq-123',
        name: 'Pioneer DDJ-FLX6',
        brand: 'Pioneer DJ',
        dailyRate: 699,
        category: 'cat-id-1',
      };

      mockEquipmentRepo.findById.mockResolvedValue(mockEquipment as any);

      const result = await equipmentService.getEquipmentById('eq-123');

      expect(mockEquipmentRepo.findById).toHaveBeenCalledWith('eq-123');
      expect(result).toEqual(mockEquipment);
    });

    it('should throw AppError(404) when equipment is not found', async () => {
      mockEquipmentRepo.findById.mockResolvedValue(null);

      await expect(equipmentService.getEquipmentById('non-existent')).rejects.toThrow(AppError);
      await expect(equipmentService.getEquipmentById('non-existent')).rejects.toThrow('Equipo no encontrado');
    });
  });

  // ─────────────────────────────────────────────
  // createEquipment()
  // ─────────────────────────────────────────────
  describe('createEquipment', () => {
    it('should create equipment when referenced category exists', async () => {
      const dto = {
        name: 'Altavoz JBL EON715',
        serialNumber: 'SN-JBL715-001',
        brand: 'JBL Professional',
        dailyRate: 150,
        category: 'cat-speakers-id',
      };

      mockCategoryRepo.findById.mockResolvedValue({ _id: 'cat-speakers-id', name: 'Sonido' } as any);
      mockEquipmentRepo.create.mockResolvedValue({
        _id: 'eq-created-1',
        ...dto,
      } as any);

      const result = await equipmentService.createEquipment(dto, 'user-id-1');

      expect(mockCategoryRepo.findById).toHaveBeenCalledWith('cat-speakers-id');
      expect(mockEquipmentRepo.create).toHaveBeenCalledWith(dto, 'user-id-1');
      expect(result.name).toBe('Altavoz JBL EON715');
    });

    it('should throw AppError(400) when referenced category does not exist', async () => {
      const dto = {
        name: 'Altavoz JBL EON715',
        serialNumber: 'SN-JBL715-001',
        brand: 'JBL Professional',
        dailyRate: 150,
        category: 'invalid-category-id',
      };

      mockCategoryRepo.findById.mockResolvedValue(null);

      await expect(equipmentService.createEquipment(dto)).rejects.toThrow('La categoría referenciada no existe');
      expect(mockEquipmentRepo.create).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // updateEquipment()
  // ─────────────────────────────────────────────
  describe('updateEquipment', () => {
    it('should update equipment successfully when data and category are valid', async () => {
      const dto = { dailyRate: 180, category: 'cat-new-id' };

      mockCategoryRepo.findById.mockResolvedValue({ _id: 'cat-new-id', name: 'Luces' } as any);
      mockEquipmentRepo.update.mockResolvedValue({
        _id: 'eq-123',
        name: 'Cabezal Móvil LED',
        dailyRate: 180,
        category: 'cat-new-id',
      } as any);

      const result = await equipmentService.updateEquipment('eq-123', dto);

      expect(mockCategoryRepo.findById).toHaveBeenCalledWith('cat-new-id');
      expect(mockEquipmentRepo.update).toHaveBeenCalledWith('eq-123', dto);
      expect(result.dailyRate).toBe(180);
    });

    it('should throw AppError(400) if new referenced category does not exist', async () => {
      const dto = { category: 'non-existent-cat' };

      mockCategoryRepo.findById.mockResolvedValue(null);

      await expect(equipmentService.updateEquipment('eq-123', dto)).rejects.toThrow(
        'La categoría referenciada no existe'
      );
    });

    it('should throw AppError(404) if equipment to update is not found', async () => {
      mockEquipmentRepo.update.mockResolvedValue(null);

      await expect(equipmentService.updateEquipment('non-existent', { dailyRate: 200 })).rejects.toThrow(
        'Equipo no encontrado'
      );
    });
  });

  // ─────────────────────────────────────────────
  // deleteEquipment()
  // ─────────────────────────────────────────────
  describe('deleteEquipment', () => {
    it('should delete equipment when found', async () => {
      mockEquipmentRepo.remove.mockResolvedValue({ _id: 'eq-123' } as any);

      await equipmentService.deleteEquipment('eq-123');

      expect(mockEquipmentRepo.remove).toHaveBeenCalledWith('eq-123');
    });

    it('should throw AppError(404) when equipment to delete is not found', async () => {
      mockEquipmentRepo.remove.mockResolvedValue(null);

      await expect(equipmentService.deleteEquipment('non-existent')).rejects.toThrow(
        'Equipo no encontrado'
      );
    });
  });
});
