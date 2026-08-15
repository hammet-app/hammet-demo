import type {Post} from '@/lib/content/types'
import PostCard from './PostCard'

type RelatedPostsProps = {
  posts: Post[]
}

export default function RelatedPosts({posts}: RelatedPostsProps) {
  if (!posts.length) {
    return null
  }

  return (
    <section className="mt-20 border-t border-purple-light pt-16">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-dark">
          Keep reading
        </p>

        <h2 className="mt-2 font-serif text-3xl tracking-tight text-purple-dark sm:text-4xl">
          You might also like
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post, index) => (
          <PostCard key={post._id} post={post} index={index} />
        ))}
      </div>
    </section>
  )
}