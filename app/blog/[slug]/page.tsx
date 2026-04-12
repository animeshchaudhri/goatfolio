import { notFound } from "next/navigation";
import { getPost, getAllPosts } from "@/lib/blog";
import { VisitorCounter } from "@/components/Blog/VisitorCounter";
import Desktop from "@/components/Desktop/Desktop";
import BlogDancers from "@/components/Dancer/BlogDancers";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${post.title} :: animesh's blog`, description: post.description };
}

export default async function BlogPost({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const post = getPost(slug);
  if (!post) notFound();

  // Direct URL visit → show desktop with blog pre-opened in a window
  if (!embed) {
    return <Desktop initialBlog={slug} />;
  }

  const qs = embed ? "?embed=1" : "";
  const html = renderMarkdown(post.content);

  return (
    <>
      <BlogDancers />
      <style>{STYLES}</style>
      <div className="page-wrap">

        {/* Top bar */}
        <div className="top-bar">
          <span>animesh&apos;s blog</span>
          <span className="top-date">{post.date}</span>
        </div>

        {/* Nav */}
        <div className="old-nav">
          <a href={`/blog${qs}`}>[ back to blog ]</a>
          <span className="nav-sep">|</span>
          <a href="https://github.com/animeshchaudhri" target="_blank" rel="noreferrer">[ github ]</a>
          <span className="nav-sep">|</span>
          <a href="mailto:hi@animesh.us">[ email me ]</a>
        </div>

        {/* Content */}
        <div className="content-outer">
          <div className="content-box">

            {/* Post header */}
            <div className="post-header">
              <h1 className="post-title">{post.title}</h1>
              <div className="post-meta-row">
                <span className="meta-item">posted: {post.date}</span>
                <span className="meta-sep">·</span>
                <span className="meta-item">by animesh</span>
              </div>
              <p className="post-desc">&ldquo;{post.description}&rdquo;</p>
              <hr className="hr-post" />
            </div>

            {/* Body */}
            <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />

            <hr className="hr-post" />

            {/* Footer nav */}
            <div className="post-footer">
              <span><a href={`/blog${qs}`}>back to all posts</a></span>
              <span className="footer-sep">·</span>
              <span><a href="mailto:hi@animesh.us">send me an email</a></span>
            </div>

          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-box">
              <div className="sidebar-title">about</div>
              <p>hi, i&apos;m animesh. i write about code, projects, and random things i find interesting.</p>
            </div>
            <div className="sidebar-box">
              <div className="sidebar-title">links</div>
              <ul className="sidebar-links">
                <li><a href="https://github.com/animeshchaudhri" target="_blank" rel="noreferrer">github</a></li>
                <li><a href="https://www.linkedin.com/in/animeshchaudhri" target="_blank" rel="noreferrer">linkedin</a></li>
                <li><a href="mailto:hi@animesh.us">email</a></li>
                <li><a href={`/blog${qs}`}>all posts</a></li>
              </ul>
            </div>
            {/* <div className="sidebar-box">
              <div className="sidebar-title">stats</div>
              <p className="counter-text">visitors: <VisitorCounter /></p>
              <p className="counter-text">online now: <span className="counter">1</span></p>
            </div> */}
            <div className="sidebar-box notice-box">
              <p>this site is<br /><span className="blink-text">under coolness</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="old-footer">
          <p>© {new Date().getFullYear()} animesh</p>

          <div className="badge-row">
            <span className="badge">i was here</span>
            <span className="badge">nothing persists</span>
            <span className="badge">temporary state</span>
            <span className="badge">memento mori</span>
          </div>
        </div>

      </div>
    </>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');

  .page-wrap {
    position: relative;
    min-height: 100vh;
    background-color: #fffff0;
    background-image: url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='1' height='1' fill='%23ddd' fill-opacity='0.3'/%3E%3C/svg%3E");
    font-family: 'Times New Roman', Times, serif;
    color: #222;
    margin: 0;
    padding: 0;
    padding-bottom: 110px;
  }

  /* Top bar */
  .top-bar {
    background: #000080;
    color: #fff;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    padding: 3px 10px;
    display: flex;
    justify-content: space-between;
  }
  .top-date { color: #aaaaff; }

  /* Nav */
  .old-nav {
    text-align: center;
    padding: 7px;
    background: #dcdcdc;
    border-bottom: 2px solid #999;
    font-size: 13px;
    font-family: 'Courier New', monospace;
  }
  .old-nav a { color: #000080; text-decoration: none; font-weight: bold; }
  .old-nav a:visited { color: #551a8b; }
  .old-nav a:hover { color: #cc0000; text-decoration: underline; }
  .nav-sep { margin: 0 6px; color: #999; }

  /* Layout */
  .content-outer {
    display: flex;
    gap: 0;
    max-width: 960px;
    margin: 20px auto;
    padding: 0 12px;
    align-items: flex-start;
  }

  /* Main content */
  .content-box {
    flex: 1;
    min-width: 0;
    margin-right: 20px;
  }

  .post-header { margin-bottom: 16px; }
  .post-title {
    font-family: 'Special Elite', 'Georgia', serif;
    font-size: 26px;
    color: #000080;
    margin: 0 0 8px;
    line-height: 1.3;
  }
  .post-meta-row { font-family: 'Courier New', monospace; font-size: 12px; color: #555; margin-bottom: 6px; }
  .meta-item { }
  .meta-sep { margin: 0 8px; }
  .post-desc { font-style: italic; color: #666; font-size: 14px; margin: 6px 0 10px; }
  .hr-post { border: none; border-top: 2px solid #999; border-bottom: 1px solid #fff; margin: 12px 0; }

  /* Body text */
  .post-body { font-size: 15px; line-height: 1.85; color: #111; }
  .post-body h2 {
    font-family: 'Courier New', monospace;
    font-size: 16px;
    color: #000080;
    border-bottom: 1px dashed #999;
    padding-bottom: 3px;
    margin: 24px 0 10px;
  }
  .post-body h3 {
    font-size: 15px;
    color: #800000;
    margin: 18px 0 8px;
  }
  .post-body p { margin: 0 0 14px; }
  .post-body ul, .post-body ol { padding-left: 24px; margin: 0 0 14px; }
  .post-body li { margin-bottom: 6px; }
  .post-body a { color: #0000cc; }
  .post-body a:visited { color: #551a8b; }
  .post-body a:hover { color: #cc0000; }
  .post-body strong { color: #000; }
  .post-body em { color: #444; }
  .post-body blockquote {
    border-left: 4px solid #999;
    margin: 12px 0 12px 8px;
    padding: 6px 12px;
    background: #f5f5dc;
    color: #555;
    font-style: italic;
  }
  .post-body code {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    background: #f0f0e0;
    border: 1px solid #ccc;
    padding: 1px 4px;
    color: #800000;
  }
  .post-body pre {
    background: #111;
    color: #00ff00;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    padding: 12px;
    overflow-x: auto;
    border: 2px inset #555;
    margin: 14px 0;
  }
  .post-body pre code { background: none; border: none; padding: 0; color: #00ff00; }

  .post-footer {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #555;
    margin-top: 16px;
  }
  .post-footer a { color: #0000cc; }
  .post-footer a:hover { color: #cc0000; }
  .footer-sep { margin: 0 10px; }

  /* Sidebar */
  .sidebar {
    width: 180px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .sidebar-box {
    background: #f0f0ff;
    border: 2px solid #999;
    padding: 8px 10px;
    font-size: 12px;
    font-family: 'Courier New', monospace;
  }
  .sidebar-title {
    font-weight: bold;
    color: #000080;
    border-bottom: 1px solid #ccc;
    margin-bottom: 6px;
    padding-bottom: 3px;
    font-size: 13px;
  }
  .sidebar-links { list-style: none; padding: 0; margin: 0; }
  .sidebar-links li { margin-bottom: 4px; }
  .sidebar-links a { color: #0000cc; text-decoration: underline; }
  .sidebar-links a:hover { color: #cc0000; }
  .sidebar-box p { margin: 0 0 4px; line-height: 1.5; color: #333; }

  .counter-text { margin: 2px 0; }
  .counter {
    font-family: 'Courier New', monospace;
    background: #000;
    color: #00ff00;
    padding: 1px 4px;
    letter-spacing: 2px;
    font-size: 11px;
  }

  .notice-box { text-align: center; background: #fff8dc; }
  .notice-box p { margin: 0; color: #555; }

  @keyframes blink { 50% { opacity: 0; } }
  .blink-text {
    animation: blink 1s step-start infinite;
    color: #cc0000;
    font-weight: bold;
  }

  /* Footer */
  .old-footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    text-align: center;
    padding: 14px;
    background: #dcdcdc;
    border-top: 3px double #999;
    font-size: 12px;
    color: #555;
    font-family: 'Courier New', monospace;
    margin-top: 20px;
  }
  .old-footer p { margin: 4px 0; }

  .badge-row { margin-top: 10px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  .badge {
    border: 2px solid #999;
    background: #fff;
    color: #000080;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 6px;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
  }

  @media (max-width: 700px) {
    .content-outer { flex-direction: column; padding: 0 10px; margin: 12px auto; }
    .content-box { margin-right: 0; }
    .sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; }
    .sidebar-box { flex: 1 1 140px; }
    .post-title { font-size: 20px; }
    .old-nav { font-size: 11px; }
  }
`;

function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false, inPre = false, preContent = "";

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (!inPre) { inPre = true; preContent = ""; }
      else { out.push(`<pre><code>${esc(preContent.trimEnd())}</code></pre>`); inPre = false; }
      continue;
    }
    if (inPre) { preContent += line + "\n"; continue; }
    if (inList && !line.startsWith("- ") && !line.startsWith("* ")) { out.push("</ul>"); inList = false; }
    if (!line.trim()) { out.push(""); continue; }
    if (line.startsWith("## ")) { out.push(`<h2>${inl(line.slice(3))}</h2>`); continue; }
    if (line.startsWith("### ")) { out.push(`<h3>${inl(line.slice(4))}</h3>`); continue; }
    if (line.startsWith("#### ")) { out.push(`<h3>${inl(line.slice(5))}</h3>`); continue; }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inl(line.slice(2))}</li>`); continue;
    }
    if (line.startsWith("> ")) { out.push(`<blockquote><p>${inl(line.slice(2))}</p></blockquote>`); continue; }
    out.push(`<p>${inl(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}
function inl(t: string) {
  return t.replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}
function esc(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
