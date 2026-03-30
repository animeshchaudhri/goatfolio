"use client";
import React, { useCallback, useEffect, useState } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { useWindowControls } from "../DraggableWindow/WindowContext";
import type { App } from "../Desktop/Desktop";
import type { PostMeta } from "../../lib/blog";

interface BlogBrowserProps {
  setIsWindowOpen: (isOpen: boolean) => void;
  addApp?: (app: App) => void;
  zIndex?: number;
  onFocus?: () => void;
}

function BlogBrowserContent({ onClose }: { onClose: () => void }) {
  const { onMinimize, onMaximize } = useWindowControls();
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [selected, setSelected] = useState<PostMeta | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data: PostMeta[]) => {
        setPosts(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="title-bar">
        <div className="title-bar-text">
          My Blog{selected ? ` ${selected.title}` : ""}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize} />
          <button aria-label="Maximize" onClick={onMaximize} />
          <button aria-label="Close" onClick={onClose} />
        </div>
      </div>

      <div style={{
        background: "linear-gradient(to bottom, #fafafa, #e8e8e8)",
        borderBottom: "1px solid #c0c0c0",
        padding: "4px 10px",
        fontSize: "12px",
        color: "#444",
        display: "flex",
        alignItems: "center",
        gap: 6,
        userSelect: "none",
      }}>
        <span style={{ color: "#1f4e8c", fontWeight: 500 }}>
          My Blog{selected ? `  ${selected.title}` : ""}
        </span>
      </div>

      <div className="window-body" style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        height: "calc(100% - 58px)",
        padding: 0,
        margin: 0,
      }}>
        <div style={{
          width: 220,
          minWidth: 220,
          background: "#f0f6fc",
          borderRight: "1px solid #b9cce5",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            padding: "6px 10px",
            borderBottom: "1px solid #d9e3f1",
            fontSize: 11,
            fontWeight: 700,
            color: "#0c3b80",
            userSelect: "none",
          }}>
            Posts
          </div>
          {posts.length === 0 ? (
            <div style={{ padding: 12, fontSize: 12, color: "#888" }}>Loading...</div>
          ) : (
            posts.map((post) => (
              <div
                key={post.slug}
                onClick={() => setSelected(post)}
                style={{
                  padding: "7px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                  borderBottom: "1px solid #e8f0f8",
                  background: selected?.slug === post.slug ? "#cce8ff" : "transparent",
                  borderLeft: selected?.slug === post.slug ? "2px solid #4a90d9" : "2px solid transparent",
                  color: "#0c3b80",
                }}
                onMouseEnter={(e) => {
                  if (selected?.slug !== post.slug)
                    (e.currentTarget as HTMLDivElement).style.background = "#e3eff9";
                }}
                onMouseLeave={(e) => {
                  if (selected?.slug !== post.slug)
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{post.title}</div>
                <div style={{ fontSize: 10, color: "#666" }}>{post.date}</div>
              </div>
            ))
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#fff" }}>
          {selected ? (
            <iframe
              key={selected.slug}
              src={`/blog/${selected.slug}`}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={selected.title}
            />
          ) : (
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
              fontSize: 13,
            }}>
              Select a post to read
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function BlogBrowser({ setIsWindowOpen, zIndex, onFocus }: BlogBrowserProps) {
  const handleClose = useCallback(() => setIsWindowOpen(false), [setIsWindowOpen]);

  return (
    <DraggableWindow
      cancelSelector=".window-body"
      zIndex={zIndex}
      width="860px"
      height="78vh"
      onFocus={onFocus}
      className="window active rounded-md shadow-lg"
    >
      <BlogBrowserContent onClose={handleClose} />
    </DraggableWindow>
  );
}

export default BlogBrowser;
