import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'
import {projectId, dataset} from './sanity/env'

export default defineConfig({
  name: 'hammet',
  title: 'Hammet Content Studio',

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure,
    }),
  ],

  schema,
})