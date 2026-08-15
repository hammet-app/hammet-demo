import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {getPost, getRelatedPosts} from '@/lib/content'
import {urlFor} from '../../../../sanity/lib/image'
import ArticleContent from '@/components/blog/ArticleContent'
import AuthorCard from '@/components/blog/AuthorCard'
import RelatedPosts from '@/components/blog/RelatedPosts'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const {slug} = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Article Not Found | Hammet',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const articleUrl = `${siteUrl}/blog/${post.slug}`
  const title = post.seoTitle || post.title
  const description =
    post.seoDescription ||
    post.excerpt ||
    'Research, ideas, and practical thinking about AI, careers, and the future of work.'

  const image = post.coverImage
    ? urlFor(post.coverImage)
        .width(1200)
        .height(630)
        .url()
    : undefined

  return {
    title,
    description,

    alternates: {
      canonical: articleUrl,
    },

    openGraph: {
      title,
      description,
      type: 'article',
      url: articleUrl,
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function BlogPostPage({params}: Props) {
  const {slug} = await params

  const post = await getPost(slug)

  const relatedPosts = post?.category?._id
    ? await getRelatedPosts(post.category._id, post._id)
    : []

  if (!post) {
    notFound()
  }

  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description:
      post.seoDescription ||
      post.excerpt ||
      'Research, ideas, and practical thinking about AI, careers, and the future of work.',
    url: articleUrl,
    datePublished: post.publishedAt,
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.name,
        }
      : undefined,
    image: post.coverImage
      ? urlFor(post.coverImage).width(1200).height(630).url()
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Hammet',
    },
  }

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <article>
        <header className="mx-auto max-w-4xl px-6 pb-12 pt-16 sm:px-8 lg:pb-16 lg:pt-24">
          {post.category?.title && (
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-dark">
              {post.category.title}
            </p>
          )}

          <h1 className="mt-5 font-serif text-4xl leading-[1.08] tracking-tight text-purple-dark sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl">
              {post.excerpt}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
            {post.author?.name && (
              <span className="font-medium text-gray-700">
                By {post.author.name}
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
        </header>

        {post.coverImage && (
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-3xl">
              <img
                src={urlFor(post.coverImage)
                  .width(1600)
                  .height(900)
                  .url()}
                alt={post.title}
                className="aspect-video w-full object-cover"
              />
            </div>
          </div>
        )}

        {post.content && (
          <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:py-20">
            <ArticleContent content={post.content} />

            <AuthorCard author={post.author} />

          </div>
        )}
      </article>
      <RelatedPosts posts={relatedPosts} />
    </main>
  )
}