import type {Author} from '@/lib/content/types'
import { urlFor } from '@/lib/content/image'

type AuthorCardProps = {
  author?: Author
}

export default function AuthorCard({author}: AuthorCardProps) {
  if (!author) {
    return null
  }

  return (
    <section className="mt-16 border-t border-purple-light pt-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-dark">
        Written by
      </p>

      <div className="mt-5 flex items-start gap-5">
        {author.photo?.asset ? (
          <img
            src={urlFor(author.photo)
              .width(160)
              .height(160)
              .fit('crop')
              .url()}
            alt={author.name}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple-light font-serif text-xl text-purple">
            {author.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <h2 className="font-serif text-xl font-semibold text-purple-dark">
            {author.name}
          </h2>

          {author.role && (
            <p className="mt-1 text-sm font-medium text-gray-500">
              {author.role}
            </p>
          )}

          {author.bio && (
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {author.bio}
            </p>
          )}

          {(author.linkedin || author.x) && (
            <div className="mt-4 flex gap-4 text-sm font-medium">
              {author.linkedin && (
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple transition-colors hover:text-cyan-dark"
                >
                  LinkedIn
                </a>
              )}

              {author.x && (
                <a
                  href={author.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple transition-colors hover:text-cyan-dark"
                >
                  X
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}