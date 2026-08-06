import { Helmet } from 'react-helmet-async';

/**
 * SEOHead — drop-in SEO wrapper for every page.
 *
 * Props:
 *   title        — page title (appended to " | Rooted")
 *   description  — meta description (155–160 chars ideal)
 *   ogImage      — Open Graph / Twitter card image URL
 *   ogType       — OG type ('website' | 'article' | 'profile')
 *   canonicalUrl — canonical URL for this page
 *   keywords     — comma-separated meta keywords
 *   noIndex      — if true, adds noindex, nofollow
 *   children     — extra <meta> / <script> tags injected into head
 */
export default function SEOHead({
  title = 'Rooted — Growing Together. Raising Kind Humans.',
  description = 'Evidence-based parenting guidance, expert articles, milestone trackers, and a supportive community for every stage of your parenting journey.',
  ogImage = '/og-default.jpg',
  ogType = 'website',
  canonicalUrl,
  keywords = '',
  noIndex = false,
  children,
}) {
  const fullTitle = title.includes('Rooted') ? title : `${title} | Rooted`;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `https://rooted-parenting.com${ogImage}`;

  return (
    <Helmet>
      {/* ── Primary meta ────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* ── Open Graph ──────────────────────────── */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Rooted" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* ── Twitter Card ────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* ── Extra children ──────────────────────── */}
      {children}
    </Helmet>
  );
}
