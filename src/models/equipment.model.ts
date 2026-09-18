import { Schema, model, Types, type Document } from 'mongoose';

export interface IEquipment extends Document {
  name: string;
  serialNumber: string;
  brand: string;
  dailyRate: number;
  isAvailable: boolean;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const equipmentSchema = new Schema<IEquipment>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del equipo es requerido'],
      trim: true,
      maxlength: [120, 'El nombre del equipo no puede superar 120 caracteres'],
    },
    serialNumber: {
      type: String,
      required: [true, 'El número de serie es requerido'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    brand: {
      type: String,
      required: [true, 'La marca es requerida'],
      trim: true,
    },
    dailyRate: {
      type: Number,
      required: [true, 'La tarifa diaria es requerida'],
      min: [0, 'La tarifa diaria no puede ser negativa'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría referenciada es requerida'],
    },
  },
  {
    timestamps: true,
  },
);

export const Equipment = model<IEquipment>('Equipment', equipmentSchema);
