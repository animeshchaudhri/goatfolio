// This file adds additional meta tags for better SEO
import Script from 'next/script';

export default function SEOBoost() {
  return (
    <>
      {/* Additional SEO meta tags for Name-specific searches */}
      <Script id="seo-boost" strategy="afterInteractive">
        {`
          document.head.innerHTML += '<meta name="author" content="Animesh Chaudhri">';
          document.head.innerHTML += '<meta name="creator" content="Animesh Chaudhri">';
          document.head.innerHTML += '<meta name="subject" content="Animesh Chaudhri - Web Developer Portfolio">';
          document.head.innerHTML += '<meta name="copyright" content="Animesh Chaudhri">';
          document.head.innerHTML += '<meta name="owner" content="Animesh Chaudhri">';
        `}
      </Script>
    </>
  );
}
