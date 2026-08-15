export const postsQuery = `*[
  _type == "post"
  && defined(publishedAt)
]
| order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  "author": author->{
    name,
    photo,
    role
  },
  "category": category->{
    title,
    "slug": slug.current
  },
  tags,
  featured,
  seoTitle,
  seoDescription,
  publishedAt
}`

export const postQuery = `*[
  _type == "post"
  && slug.current == $slug
  && defined(publishedAt)
][0]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  content,
  "author": author->{
    name,
    photo,
    role,
    bio,
    linkedin,
    x
  },
  "category": category->{
    "_id": _id,
    title,
    "slug": slug.current
  },
  tags,
  featured,
  seoTitle,
  seoDescription,
  publishedAt
}`

export const relatedPostsQuery = `*[
  _type == "post"
  && defined(publishedAt)
  && category._ref == $categoryId
  && _id != $postId
]
| order(publishedAt desc)[0...3]{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  "author": author->{
    name,
    photo,
    role
  },
  "category": category->{
    title,
    "slug": slug.current
  },
  publishedAt
}`