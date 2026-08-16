import Link from 'next/link'
import { urlFor } from '@/lib/content/image'
import { Post } from '@/lib/content/types'

type PostCardProps = {
  post: Post
  index: number
}

export default function PostCard({post, index}: PostCardProps) {
  return (
    <article
      className="blog-card-enter group"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      <Link href={`/blog/${post.slug}`}>
        <div className="overflow-hidden rounded-2xl border border-purple-light bg-white shadow-sm transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-xl">
          <div className="relative aspect-[16/10] overflow-hidden bg-purple-light">
            {post.coverImage ? (
              <img
                src={urlFor(post.coverImage).width(800).height(500).url()}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-serif text-3xl text-purple/30">
                  Hammet
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            {post.category?.title && (
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-dark">
                {post.category.title}
              </p>
            )}

            <h2 className="mt-3 font-serif text-2xl leading-tight text-purple-dark transition-colors duration-300 group-hover:text-purple">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                {post.excerpt}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {post.author?.name && (
                <span className="font-medium text-gray-700">
                  {post.author.name}
                </span>
              )}

              {post.publishedAt && (
                <>
                  <span>·</span>
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}