import BlogHero from '@/components/blog/BlogHero'
import FeaturedPost from '@/components/blog/FeaturedPost'
import PostGrid from '@/components/blog/PostGrid'
import {getPosts} from '@/lib/content'
import { Post } from '@/lib/content/types'

export default async function BlogPage() {
  const posts = await getPosts()

  const featuredPost =
    posts.find((post: Post) => post.featured) ?? posts[0]

  const remainingPosts = featuredPost
    ? posts.filter((post: Post) => post._id !== featuredPost._id)
    : []

  return (
    <main className="min-h-screen bg-gray-50">
      <BlogHero />

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
        {featuredPost && (
          <section>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-dark">
                Featured
              </p>

              <h2 className="mt-2 font-serif text-3xl tracking-tight text-purple-dark sm:text-4xl">
                Start here
              </h2>
            </div>

            <FeaturedPost post={featuredPost} />
          </section>
        )}

        {remainingPosts.length > 0 && (
          <section className="mt-20">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-dark">
                Latest
              </p>

              <h2 className="mt-2 font-serif text-3xl tracking-tight text-purple-dark sm:text-4xl">
                From the journal
              </h2>
            </div>

            <PostGrid posts={remainingPosts} />
          </section>
        )}
      </section>
    </main>
  )
}