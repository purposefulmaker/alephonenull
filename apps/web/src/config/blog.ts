import type { BlogConfig } from '../lib/opendocs/types/blog'

export const blogConfig: BlogConfig = {
  mainNav: [
    {
      href: '/blog',

      title: {
        en: 'Blog',
      },
    },
  ],

  authors: [
    {
      /* the id property must be the same as author_id in the blog post mdx files required for the computed field
        in contentlayer.config.ts so we can get the author details from the blogConfig by comparing the author_id
        with the id below
      */
      id: 'daltonmenezes',
      name: 'John Bernard',
      image: '/images/avatar.png',
      site: 'https://purposefulmaker.com',
      email: 'contact@alephonenull.com',

      bio: {
        en: 'Founder | Writer | Builder',
        pt: 'Fundador | Escritor | Construtor',
      },

      social: {
        github: '',
        twitter: '',
        youtube: '',
        linkedin: '',
      },
    },
  ],

  rss: [
    {
      type: 'xml',
      file: 'blog.xml',
      contentType: 'application/xml',
    },

    {
      type: 'json',
      file: 'blog.json',
      contentType: 'application/json',
    },
  ],
} as const
