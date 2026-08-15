import {PortableText} from '@portabletext/react'
import type {PortableTextBlock} from '@portabletext/types'
import { urlFor } from '@/lib/content/image'

type ArticleContentProps = {
  content: PortableTextBlock[]
}

export default function ArticleContent({content}: ArticleContentProps) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-semibold prose-headings:text-purple-dark prose-p:text-gray-700 prose-p:leading-8 prose-a:text-purple prose-a:no-underline hover:prose-a:underline prose-strong:text-purple-dark prose-blockquote:border-cyan prose-blockquote:text-purple-dark">
      <PortableText
        value={content}
        components={{
          block: {
            h2: ({children}) => (
              <h2 className="mt-12 text-3xl leading-tight text-purple-dark">
                {children}
              </h2>
            ),

            h3: ({children}) => (
              <h3 className="mt-10 text-2xl leading-tight text-purple-dark">
                {children}
              </h3>
            ),

            blockquote: ({children}) => (
              <blockquote className="my-10 border-l-4 border-cyan pl-6 text-xl italic leading-8 text-purple-dark">
                {children}
              </blockquote>
            ),
          },

          types: {
            image: ({value}) => {
              if (!value?.asset) {
                return null
              }

              return (
                <figure className="my-10">
                  <img
                    src={urlFor(value)
                      .width(1200)
                      .fit('max')
                      .auto('format')
                      .url()}
                    alt={value.alt || ''}
                    className="w-full rounded-2xl"
                  />

                  {value.caption && (
                    <figcaption className="mt-3 text-center text-sm text-gray-500">
                      {value.caption}
                    </figcaption>
                  )}
                </figure>
              )
            },
          },

          marks: {
            link: ({children, value}) => (
              <a
                href={value?.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
          },
        }}
      />
    </div>
  )
}