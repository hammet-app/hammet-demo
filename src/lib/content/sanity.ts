import {createClient} from 'next-sanity'

console.log(
  '[Sanity] dataset available:',
  Boolean(process.env.NEXT_PUBLIC_SANITY_DATASET)
)

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-08-09',
  useCdn: true,
})