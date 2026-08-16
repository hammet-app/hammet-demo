export default function BlogHero() {
  return (
    <section className="blog-hero relative overflow-hidden">
      <div className="blog-hero-glow blog-hero-glow-one" />
      <div className="blog-hero-glow blog-hero-glow-two" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="blog-fade-up max-w-3xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-cyan">
            The Hammet Journal
          </p>

          <h1 className="font-serif text-5xl leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Ideas for the future of AI and work.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
            Research, practical guides, and ideas helping the next generation
            understand AI and build careers around it.
          </p>
        </div>
      </div>
    </section>
  )
}