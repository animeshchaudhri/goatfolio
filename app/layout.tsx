import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import SEOBoost from "@/components/SEO/SEOBoost";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Animesh Chaudhri | Interactive Windows 7 Portfolio",
  description: "Explore Animesh Chaudhri's interactive Windows 7-inspired portfolio showcasing web development and programming projects with a nostalgic UI experience.",
  keywords: "Animesh Chaudhri, portfolio, web developer, programmer, Windows 7, interactive portfolio, frontend developer, React developer",
  authors: [{ name: "Animesh Chaudhri" }],
  creator: "Animesh Chaudhri",
  publisher: "Animesh Chaudhri",
  metadataBase: new URL("https://animesh.us"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Animesh Chaudhri | Interactive Windows 7 Portfolio",
    description: "Explore Animesh Chaudhri's interactive Windows 7-inspired portfolio showcasing web development and programming projects with a nostalgic UI experience.",
    url: "https://animesh.us",
    siteName: "Animesh Chaudhri Portfolio",
    images: [
      {
        url: "/images/wallpaper2.jpg",
        width: 1200,
        height: 630,
        alt: "Animesh Chaudhri Portfolio Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Animesh Chaudhri | Interactive Windows 7 Portfolio",
    description: "Explore Animesh Chaudhri's interactive Windows 7-inspired portfolio showcasing web development and programming projects with a nostalgic UI experience.",
    images: ["/images/wallpaper2.jpg"],
    creator: "@animesh_xd",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Animesh Chaudhri",
              "url": "https://animesh.us",
              "image": "https://animesh.us/images/wallpaper2.jpg",
              "sameAs": [
                "https://github.com/animeshchaudhri", 
                "https://linkedin.com/in/animeshchaudhri",
                "https://twitter.com/animesh_xd"
              ],
              "jobTitle": "Web Developer",
              "worksFor": {
                "@type": "Organization",
                "name": "Animesh Chaudhri Portfolio"
              },
              "description": "Web developer specializing in interactive and nostalgic user interfaces with a Windows 7-inspired portfolio.",
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://animesh.us"
              }
            })
          }}
        />
      </head>      <body className={inter.className}>
        <SEOBoost />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
