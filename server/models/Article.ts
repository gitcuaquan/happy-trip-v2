import mongoose, { Schema, type Document, type Model } from 'mongoose'

export interface IArticle {
  // Nội dung chính
  title: string
  slug: string
  excerpt?: string
  content?: string
  thumbnail?: string
  category: 'blog' | 'policy'
  status: boolean
  views: number
  reading_time?: number
  author_name?: string

  // SEO & Social Fields
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  focus_keyword?: string
  canonical_url?: string
  og_image?: string
  noindex: boolean

  published_at?: Date
  created_at?: Date
  updated_at?: Date
}

export interface IArticleDocument extends IArticle, Document {}

const ArticleSchema = new Schema<IArticleDocument>(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề bài viết không được để trống'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Đường dẫn slug không được để trống'],
      unique: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['blog', 'policy'],
      default: 'blog',
      index: true,
    },
    status: {
      type: Boolean,
      default: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    reading_time: {
      type: Number,
      default: 3,
    },
    author_name: {
      type: String,
      default: 'Happy Trip',
    },

    // SEO Fields
    meta_title: {
      type: String,
      default: '',
    },
    meta_description: {
      type: String,
      default: '',
    },
    meta_keywords: {
      type: [String],
      default: [],
    },
    focus_keyword: {
      type: String,
      default: '',
    },
    canonical_url: {
      type: String,
      default: '',
    },
    og_image: {
      type: String,
      default: '',
    },
    noindex: {
      type: Boolean,
      default: false,
    },
    published_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

export const Article: Model<IArticleDocument> =
  mongoose.models.Article || mongoose.model<IArticleDocument>('Article', ArticleSchema)
