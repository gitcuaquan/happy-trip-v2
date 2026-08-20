import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IAdmin {
  username: string
  password: string
  full_name: string
  created_at?: Date
  updated_at?: Date
}

export interface IAdminDocument extends IAdmin, Document {}

const AdminSchema = new Schema<IAdminDocument>(
  {
    username: {
      type: String,
      required: [true, 'Tên đăng nhập không được để trống'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu không được để trống'],
    },
    full_name: {
      type: String,
      required: [true, 'Họ và tên không được để trống'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

export const Admin: Model<IAdminDocument> =
  mongoose.models.Admin || mongoose.model<IAdminDocument>('Admin', AdminSchema)
