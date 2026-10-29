import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IPopupModal {
  title: string
  image: string
  link?: string
  article_id?: mongoose.Types.ObjectId | null
  article_slug?: string
  article_title?: string
  button_text?: string
  is_active: boolean
  display_frequency: 'new_only' | 'daily' | 'session' | 'always'
  created_at?: Date
  updated_at?: Date
}

export interface IPopupModalDocument extends IPopupModal, Document {}

const PopupModalSchema = new Schema<IPopupModalDocument>(
  {
    title: {
      type: String,
      default: 'Thông báo',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
    article_id: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
    },
    article_slug: {
      type: String,
      default: '',
    },
    article_title: {
      type: String,
      default: '',
    },
    button_text: {
      type: String,
      default: 'Xem chi tiết',
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: false,
      index: true,
    },
    display_frequency: {
      type: String,
      enum: ['new_only', 'daily', 'session', 'always'],
      default: 'new_only',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

export const PopupModal: Model<IPopupModalDocument> =
  mongoose.models.PopupModal || mongoose.model<IPopupModalDocument>('PopupModal', PopupModalSchema)
