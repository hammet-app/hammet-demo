import type {PortableTextBlock} from '@portabletext/types'

export type Author = {
  name: string
  photo?: {
    asset?: {
      _ref: string
    }
  }
  role?: string
  bio?: string
  linkedin?: string
  x?: string
}

export type Category = {
  _id: string;
  title: string
  slug: string
}

export type Post = {
  _id: string
  title: string
  slug: string
  excerpt?: string
  coverImage?: {
    asset?: {
      _ref: string
    }
  }
  content?: PortableTextBlock[]
  author?: Author
  category?: Category
  tags?: string[]
  featured?: boolean
  seoTitle?: string
  seoDescription?: string
  publishedAt?: string
}