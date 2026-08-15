import {client} from './sanity'
import {postsQuery, postQuery, relatedPostsQuery} from './queries'
import type {Post} from './types'

export async function getPosts(): Promise<Post[]> {
  return client.fetch(postsQuery, {}, {
    next: {
      revalidate: 60,
    },
  })
}

export async function getPost(slug: string): Promise<Post | null> {
  return client.fetch(postQuery, {slug}, {
    next: {
      revalidate: 60,
    },
  })
}

export async function getRelatedPosts(
  categoryId: string,
  postId: string,
): Promise<Post[]> {
  return client.fetch(relatedPostsQuery, {
    categoryId,
    postId,
  })
}