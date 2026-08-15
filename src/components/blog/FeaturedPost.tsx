import Link from 'next/link'
import {urlFor} from '../../../sanity/lib/image'
import { Post } from '@/lib/content/types'

type FeaturedPostProps = {
  post: Post
}

export default function FeaturedPost({post}: FeaturedPostProps) {
  return (
    <article className="blog-fade-up group overflow-hidden rounded-3xl border border-purple-light bg-white shadow-sm">
      <Link href={`/blog/${post.slug}`}>
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-[16/10] overflow-hidden bg-purple-light lg:aspect-auto">
            {post.coverImage ? (
              <img
                src={urlFor(post.coverImage).width(1200).height(800).url()}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full min-h-72 items-center justify-center bg-purple-light">
                <span className="font-serif text-4xl text-purple/30">
                  Hammet
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            {post.category?.title && (
              <span className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-dark">
                {post.category.title}
              </span>
            )}

            <h2 className="mt-4 font-serif text-3xl leading-tight text-purple-dark transition-colors duration-300 group-hover:text-purple sm:text-4xl">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="mt-5 text-base leading-7 text-gray-600">
                {post.excerpt}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-2 text-sm text-gray-500">
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
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </>
              )}
            </div>

            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-purple transition-all duration-300 group-hover:gap-3">
              Read article
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}