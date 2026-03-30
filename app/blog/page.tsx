import { getAllPosts } from "@/lib/blog";
import { VisitorCounter } from "@/components/Blog/VisitorCounter";

export const metadata = {
  title: "animesh's blog",
  description: "my corner of the internet",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <style>{STYLES}</style>
      <div className="page-wrap">

        {/* Header */}
        <div className="site-header">
          <div className="marquee-wrap">
            <span className="marquee-text">
              welcome to my corner of the internet :: you found me nice :: last updated 2026 ::
            </span>
          </div>
          <h1 className="site-title">animesh&apos;s blog</h1>
          <p className="site-sub">~ thoughts, experiments &amp; things i learned ~</p>
          <div className="divider-stars">* * * * * * * * * * * * * * * * * * * * * * *</div>
        </div>

        {/* Nav */}
        <div className="old-nav">
          <a href="/blog">[ blog ]</a>
          <span className="nav-sep">|</span>
          <a href="https://github.com/animeshchaudhri" target="_blank" rel="noreferrer">[ github ]</a>
          <span className="nav-sep">|</span>
          <a href="mailto:hi@animesh.us">[ email me ]</a>
        </div>

        <hr className="hr-fancy" />

        {/* Post list */}
        <div className="content-box">
          <h2 className="section-title">posts ({posts.length} total)</h2>

          {posts.length === 0 ? (
            <p className="empty-msg">no posts yet. check back soon!</p>
          ) : (
            <table className="post-table">
              <tbody>
                {posts.map((post) => (
                  <tr key={post.slug} className="post-row">
                    <td className="td-icon">::</td>
                    <td className="td-title">
                      <a href={`/blog/${post.slug}`} className="post-link">{post.title}</a>
                      <br />
                      <span className="post-desc">{post.description}</span>
                    </td>
                    <td className="td-date">[{post.date}]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <hr className="hr-fancy" />

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
    padding: 0;
    padding-bottom: 120px;
    margin: 0;
  }

  /* Marquee */
  .marquee-wrap {
    background: #000080;
    color: #ffff00;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    padding: 3px 0;
    overflow: hidden;
    white-space: nowrap;
  }
  .marquee-text {
    display: inline-block;
    animation: marquee 22s linear infinite;
  }
  .counter {
    font-family: 'Courier New', monospace;
    color: #ffff00;
    letter-spacing: 1px;
  }
  @keyframes marquee {
    0%   { transform: translateX(100vw); }
    100% { transform: translateX(-100%); }
  }

  /* Header */
  .site-header {
    text-align: center;
    padding: 20px 16px 10px;
    border-bottom: 3px double #999;
    background: linear-gradient(180deg, #e8e8ff 0%, #fffff0 100%);
  }
  .site-title {
    font-family: 'Special Elite', 'Courier New', monospace;
    font-size: 36px;
    color: #000080;
    margin: 12px 0 4px;
    text-shadow: 2px 2px 0 #aaa;
    letter-spacing: 2px;
  }
  .site-sub {
    font-size: 14px;
    color: #555;
    font-style: italic;
    margin: 0 0 10px;
  }
  .divider-stars {
    color: #800000;
    font-size: 12px;
    letter-spacing: 2px;
    margin-top: 8px;
  }

  /* Nav */
  .old-nav {
    text-align: center;
    padding: 8px;
    background: #dcdcdc;
    border-bottom: 2px solid #999;
    font-size: 13px;
    font-family: 'Courier New', monospace;
  }
  .old-nav a { color: #000080; text-decoration: none; font-weight: bold; }
  .old-nav a:visited { color: #551a8b; }
  .old-nav a:hover { color: #cc0000; text-decoration: underline; }
  .nav-sep { margin: 0 6px; color: #999; }

  /* Divider */
  .hr-fancy {
    border: none;
    border-top: 1px solid #999;
    border-bottom: 1px solid #fff;
    margin: 0;
  }

  /* Content */
  .content-box {
    max-width: 720px;
    margin: 20px auto;
    padding: 0 16px;
  }
  .section-title {
    font-family: 'Courier New', monospace;
    font-size: 15px;
    color: #000080;
    border-bottom: 1px dashed #999;
    padding-bottom: 4px;
    margin-bottom: 14px;
  }

  /* Table */
  .post-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .post-row { border-bottom: 1px dotted #bbb; }
  .post-row:hover { background: #eeeeff; }
  .td-icon { width: 24px; padding: 8px 4px; vertical-align: top; font-size: 16px; }
  .td-title { padding: 8px 8px 8px 4px; vertical-align: top; }
  .td-date { padding: 8px 4px; vertical-align: top; white-space: nowrap; font-family: 'Courier New', monospace; font-size: 12px; color: #666; }
  .post-link { color: #0000cc; font-weight: bold; text-decoration: underline; font-size: 15px; }
  .post-link:visited { color: #551a8b; }
  .post-link:hover { color: #cc0000; }
  .post-desc { color: #555; font-size: 12px; font-style: italic; }

  .empty-msg { color: #888; font-style: italic; }

  /* Footer */
  .old-footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    text-align: center;
    padding: 16px;
    background: #dcdcdc;
    border-top: 3px double #999;
    font-size: 12px;
    color: #555;
    font-family: 'Courier New', monospace;
  }
  .old-footer p { margin: 4px 0; }

  @keyframes blink { 50% { opacity: 0; } }
  .blink-text {
    animation: blink 1.2s step-start infinite;
    color: #cc0000;
    font-weight: bold;
  }

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

  @media (max-width: 600px) {
    .site-title { font-size: 24px; }
    .divider-stars { display: none; }
    .old-nav { font-size: 11px; }
    .content-box { padding: 0 10px; }
    .post-table { font-size: 13px; }
    .td-date { display: none; }
  }
`;
