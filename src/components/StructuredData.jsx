/**
 * StructuredData — injects JSON-LD schema.org data into <head>.
 * Pass a plain JS object; it gets stringified into <script type="application/ld+json">.
 */

export function JsonLd({ data }) {
  // ⚠️ Do NOT nest <JsonLd> inside <Helmet>/<SEOHead> — react-helmet-async
  // rejects component children and throws at render time.
  // Inside SEOHead, use a raw tag instead:
  //   <script type="application/ld+json">{JSON.stringify(data)}</script>
  return (
    <script type="application/ld+json">
      {JSON.stringify(data, null, 0)}
    </script>
  );
}

/* ── Helpers: pre-built schema objects ──────────────────────── */

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rooted',
    url: 'https://rooted-parenting.com',
    logo: 'https://rooted-parenting.com/og-default.jpg',
    description:
      'Evidence-based parenting guidance, expert articles, milestone trackers, and a supportive community for every stage of your parenting journey.',
    sameAs: [
      'https://twitter.com/rootedparenting',
      'https://facebook.com/rootedparenting',
      'https://instagram.com/rootedparenting',
    ],
    foundingDate: '2025',
  };
}

export function articleSchema({ title, description, authorName, datePublished, imageUrl, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: imageUrl || 'https://rooted-parenting.com/og-default.jpg',
    author: {
      '@type': 'Person',
      name: authorName,
    },
    datePublished: datePublished,
    publisher: {
      '@type': 'Organization',
      name: 'Rooted',
      logo: {
        '@type': 'ImageObject',
        url: 'https://rooted-parenting.com/og-default.jpg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

export function personSchema({ name, jobTitle, description, imageUrl, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle,
    description,
    image: imageUrl || 'https://rooted-parenting.com/og-default.jpg',
    url,
  };
}

export function faqSchema(questions) {
  // questions = [{ question: string, answer: string }]
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items) {
  // items = [{ name: string, url: string }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
