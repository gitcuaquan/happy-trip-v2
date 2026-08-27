import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IMegaMenuItem {
  title: string
  description?: string
  link: string
  item_type: 'route' | 'article' | 'custom'
  article_id?: mongoose.Types.ObjectId
  badge?: string
  order: number
  is_active: boolean
}

export interface IMegaMenuColumn {
  column_id: string
  title: string
  icon: string
  order: number
  items: IMegaMenuItem[]
}

export interface IMegaMenuBannerTop {
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
}

export interface IMegaMenuFooterBar {
  items: string[]
  hotline: string
}

export interface IMegaMenu {
  menu_key: string
  title: string
  banner_top: IMegaMenuBannerTop
  columns: IMegaMenuColumn[]
  footer_bar: IMegaMenuFooterBar
  is_active: boolean
  created_at?: Date
  updated_at?: Date
}

export interface IMegaMenuDocument extends IMegaMenu, Document {}

const MegaMenuItemSchema = new Schema<IMegaMenuItem>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    link: { type: String, required: true, trim: true },
    item_type: {
      type: String,
      enum: ['route', 'article', 'custom'],
      default: 'route',
    },
    article_id: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
    },
    badge: { type: String, default: '' },
    order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { _id: false }
)

const MegaMenuColumnSchema = new Schema<IMegaMenuColumn>(
  {
    column_id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    icon: { type: String, default: 'i-lucide-route', trim: true },
    order: { type: Number, default: 0 },
    items: { type: [MegaMenuItemSchema], default: [] },
  },
  { _id: false }
)

const MegaMenuSchema = new Schema<IMegaMenuDocument>(
  {
    menu_key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    banner_top: {
      title: { type: String, default: 'Thuê Xe Riêng Đi Tỉnh 2 Chiều & Sân Bay' },
      subtitle: { type: String, default: 'Đón trả tận nhà · Giá trọn gói minh bạch · Phục vụ 24/7' },
      cta_text: { type: String, default: 'Xem cam kết dịch vụ' },
      cta_link: { type: String, default: '/#dich-vu' },
    },
    columns: {
      type: [MegaMenuColumnSchema],
      default: [],
    },
    footer_bar: {
      items: {
        type: [String],
        default: ['Bao trọn xe 100%', 'Đón đúng giờ hẹn', '0đ phụ phí ẩn'],
      },
      hotline: { type: String, default: '0972 97 0000' },
    },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

export const MegaMenu: Model<IMegaMenuDocument> =
  mongoose.models.MegaMenu || mongoose.model<IMegaMenuDocument>('MegaMenu', MegaMenuSchema)
