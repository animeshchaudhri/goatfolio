"use client";
import React, { useEffect, useRef, useState } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { TitleBar, FONT } from "./Chrome";
import type { WindowProps } from "../Desktop/windows";

// Windows Live Messenger 2009 conversation window with Animesh. "Send" hands the whole
// conversation to the visitor's mail client, addressed to hi@animesh.us.

const EMAIL = "hi@animesh.us";
const AVATAR = "https://github.com/animeshchaudhri.png";

type Msg = { from: "Animesh" | "You" | "system"; lines: string[]; at: Date };

const EMOTICONS = [
  "🙂", "😃", "😉", "😮", "😛", "😎", "😠", "😕", "😳", "😢", "😇", "😈",
  "🤓", "🤔", "😴", "☕", "❤️", "💔", "🌹", "🎁", "👍", "👎", "⭐", "🎉",
];

const time = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const date = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

// ─── little toolbar glyphs ───────────────────────────────────────────────────
const GLYPHS: Record<string, React.ReactNode> = {
  invite: <><circle cx="6" cy="5" r="3" fill="#5aa6e8" /><path d="M1 14c0-3 2.2-5 5-5s5 2 5 5z" fill="#2f7fd0" /><path d="M12 4v6M9 7h6" stroke="#2e9e2e" strokeWidth="2" /></>,
  files: <><path d="M2 4h5l1.5 1.5H14v8H2z" fill="#f4c94e" stroke="#c79a1c" /><path d="M8 7v4M6 9l2 2 2-2" stroke="#2f7fd0" strokeWidth="1.4" fill="none" /></>,
  video: <><rect x="1.5" y="4.5" width="9" height="7" rx="1.5" fill="#5f6b7a" /><path d="M10.5 7l4-2.5v7l-4-2.5z" fill="#3e4753" /></>,
  call: <path d="M3 2c1.5-1 2.5-.5 3 .5l1 2c.3.7 0 1.3-.6 1.6l-.8.5c.7 1.5 1.8 2.6 3.3 3.3l.5-.8c.3-.6 1-.9 1.6-.6l2 1c1 .5 1.5 1.5.5 3-1 1.5-3 1.5-5 .5C5.5 12 3 9 2 6c-.5-1.5 0-3 1-4z" fill="#2e9e2e" />,
  games: <><rect x="1" y="5" width="14" height="7" rx="3.5" fill="#6b7686" /><path d="M4 7.2v2.6M2.7 8.5h2.6" stroke="#fff" strokeWidth="1.2" /><circle cx="11" cy="7.6" r="1" fill="#ff5a4a" /><circle cx="12.6" cy="9.2" r="1" fill="#5aa6e8" /></>,
  activities: <><circle cx="8" cy="8" r="6.5" fill="#f2a33a" /><path d="M5 8.5l2 2 4-4.5" stroke="#fff" strokeWidth="1.6" fill="none" /></>,
  block: <><circle cx="8" cy="8" r="6" fill="none" stroke="#d9241b" strokeWidth="2" /><path d="M4 12L12 4" stroke="#d9241b" strokeWidth="2" /></>,
  smile: <><circle cx="8" cy="8" r="6.5" fill="#ffd94a" stroke="#d29d0e" /><circle cx="5.8" cy="6.5" r="0.9" fill="#5a3b00" /><circle cx="10.2" cy="6.5" r="0.9" fill="#5a3b00" /><path d="M5 9.5c1.6 2 4.4 2 6 0" stroke="#5a3b00" fill="none" strokeWidth="1" /></>,
  wink: <><circle cx="8" cy="8" r="6.5" fill="#ffd94a" stroke="#d29d0e" /><path d="M4.8 6.6h2" stroke="#5a3b00" strokeWidth="1" /><circle cx="10.2" cy="6.5" r="0.9" fill="#5a3b00" /><path d="M5 9.5c1.6 2 4.4 2 6 0" stroke="#5a3b00" fill="none" strokeWidth="1" /></>,
  nudge: <><circle cx="8" cy="8" r="5.5" fill="#ffd94a" stroke="#d29d0e" /><circle cx="6.3" cy="7" r="0.8" fill="#5a3b00" /><circle cx="9.7" cy="7" r="0.8" fill="#5a3b00" /><ellipse cx="8" cy="10.3" rx="1.4" ry="1" fill="#5a3b00" /><path d="M1 4.5L2.5 6M1 11.5L2.5 10M15 4.5L13.5 6M15 11.5L13.5 10" stroke="#2f7fd0" strokeWidth="1.2" /></>,
  voice: <><rect x="6" y="1.5" width="4" height="8" rx="2" fill="#6b7686" /><path d="M4 7.5a4 4 0 0 0 8 0M8 11.5V14M5.5 14h5" stroke="#6b7686" fill="none" strokeWidth="1.2" /></>,
  font: <><path d="M3 13L7 3h2l4 10M4.8 9.5h6.4" stroke="#1e3287" strokeWidth="1.6" fill="none" /></>,
  background: <><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" fill="#a9d4f5" stroke="#5a8fc4" /><path d="M2 12l4-4 3 3 2-2 3 3" stroke="#2e9e2e" fill="none" strokeWidth="1.2" /></>,
};

function Glyph({ name, size = 16 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>{GLYPHS[name]}</svg>;
}

function ToolBtn({ glyph, title, onClick, disabled, arrow, active }: {
  glyph: string; title: string; onClick?: () => void; disabled?: boolean; arrow?: boolean; active?: boolean;
}) {
  return (
    <button
      type="button" title={title} aria-label={title} disabled={disabled} onClick={onClick}
      className={`wlm-tool${active ? " wlm-tool-on" : ""}`}
      style={{ minWidth: 0, minHeight: 0, height: 24, padding: arrow ? "0 3px 0 4px" : "0 4px", display: "flex", alignItems: "center", gap: 2 }}
    >
      <Glyph name={glyph} />
      {arrow && <span style={{ fontSize: 7, color: "#444" }}>▼</span>}
    </button>
  );
}

// Glossy WLM display-picture frame, green = Available
function DisplayPicture({ src, size }: { src?: string; size: number }) {
  return (
    <div style={{
      width: size + 10, height: size + 10, padding: 5, boxSizing: "border-box", borderRadius: 8, flexShrink: 0,
      background: "linear-gradient(160deg,#c9f7a8 0%,#6ad44b 38%,#2c9c25 52%,#5ccf3f 80%,#b2ef8f 100%)",
      boxShadow: "0 1px 3px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.7)",
    }}>
      <div style={{ width: size, height: size, borderRadius: 4, overflow: "hidden", background: "#fff", boxShadow: "0 0 0 1px rgba(0,60,0,.35)" }}>
        {src ? (
          <img src={src} width={size} height={size} alt="" style={{ display: "block", objectFit: "cover" }} />
        ) : (
          // default WLM "buddy" picture
          <svg width={size} height={size} viewBox="0 0 48 48">
            <defs>
              <linearGradient id="wlm-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8f5ff" /><stop offset="1" stopColor="#b9dcf7" /></linearGradient>
              <linearGradient id="wlm-buddy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fdc6a" /><stop offset="1" stopColor="#2c9c25" /></linearGradient>
            </defs>
            <rect width="48" height="48" fill="url(#wlm-bg)" />
            <circle cx="24" cy="17" r="8" fill="url(#wlm-buddy)" />
            <path d="M9 46c0-10 6.7-16 15-16s15 6 15 16z" fill="url(#wlm-buddy)" />
          </svg>
        )}
      </div>
    </div>
  );
}

export default function Messenger({ app, onClose, zIndex, onFocus, minimized, onMinimize }: WindowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const convo = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => [{
    from: "Animesh", at: new Date(),
    lines: [
      "hey! 👋 thanks for stopping by my little Windows 7.",
      "got a question, an idea, or just want to say hi? type it below and hit Send.",
    ],
  }]);
  const lastReceived = [...messages].reverse().find((m) => m.from === "Animesh")?.at ?? new Date();

  useEffect(() => { convo.current?.scrollTo({ top: convo.current.scrollHeight }); }, [messages, typing]);

  const reply = (lines: string[]) => {
    setTimeout(() => setTyping(true), 700);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "Animesh", lines, at: new Date() }]);
    }, 2400);
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const mine: Msg = { from: "You", lines: text.split("\n"), at: new Date() };
    const all = [...messages, mine];
    setMessages(all);
    setDraft("");
    const transcript = all
      .filter((m) => m.from !== "system")
      .map((m) => `${m.from} says (${time(m.at)}):\n${m.lines.map((l) => `  ${l}`).join("\n")}`)
      .join("\n\n");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Hi from your Windows 7 site")}&body=${encodeURIComponent(transcript)}`;
    reply(["your email app should've popped up with our chat in it 📬", "hit send there and it lands straight in my inbox. talk soon!"]);
    input.current?.focus();
  };

  const nudge = () => {
    setMessages((m) => [...m, { from: "system", lines: ["You have just sent a nudge."], at: new Date() }]);
    const win = rootRef.current?.closest(".window") as HTMLElement | null;
    win?.animate(
      [0, -6, 6, -6, 6, -4, 4, -2, 0].map((x, i) => ({ translate: `${x}px ${i % 2 ? 3 : -3}px` })),
      { duration: 550, easing: "linear" }
    );
  };

  const insert = (s: string) => {
    const t = input.current;
    if (!t) { setDraft((d) => d + s); return; }
    const { selectionStart: a, selectionEnd: b } = t;
    setDraft(draft.slice(0, a) + s + draft.slice(b));
    requestAnimationFrame(() => { t.focus(); t.setSelectionRange(a + s.length, a + s.length); });
    setEmoji(false);
  };

  return (
    <DraggableWindow
      cancelSelector=".wlm-body"
      zIndex={zIndex}
      width="560px"
      height="480px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active"
    >
      <style>{`
        .wlm-tool { background: transparent !important; border: 1px solid transparent !important; box-shadow: none !important; animation: none !important; border-radius: 3px; }
        .wlm-tool:not(:disabled):hover, .wlm-tool-on { background: linear-gradient(#fdfeff,#dcecfb) !important; border-color: #a7c9ec !important; }
        .wlm-tool:disabled { opacity: .45; }
        .wlm-tool:disabled:before, .wlm-tool:before { display: none; }
        .wlm-emo:hover { background: #dcecfb; outline: 1px solid #a7c9ec; }
        @media (max-width: 560px) { .wlm-side { display: none !important; } .wlm-head-dp { display: flex !important; } }
      `}</style>
      <TitleBar title={app.title} icon="/icons/chat.png" onClose={onClose} />
      <div ref={rootRef} className="wlm-body" style={{
        flex: 1, minHeight: 0, display: "flex", flexDirection: "column", fontFamily: FONT, fontSize: 12, color: "#000",
        margin: "0 6px 6px", border: "1px solid rgba(0,0,0,.45)", borderRadius: 2, overflow: "hidden",
        background: "radial-gradient(120% 70% at 85% 0%, #c6ecb4 0%, rgba(198,236,180,0) 45%), linear-gradient(180deg,#cfe5f8 0%,#e4f0fb 42%,#f3f8fd 100%)",
      }}>
        {/* header: contact + toolbar */}
        <div style={{ padding: "8px 10px 4px", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div className="wlm-head-dp" style={{ display: "none" }}><DisplayPicture src={AVATAR} size={34} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Animesh</span>
              <span style={{ color: "#4d5d6e" }}> (Available)</span>
              <span style={{ color: "#6d6d6d" }}> &lt;{EMAIL}&gt;</span>
            </div>
            <div style={{ color: "#4d5d6e", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
              ♫ building things on the internet · Pune, India
            </div>
            <div style={{ display: "flex", gap: 1, marginTop: 5 }}>
              <ToolBtn glyph="invite" title="Invite someone to this conversation" disabled />
              <ToolBtn glyph="files" title="Share files" disabled />
              <ToolBtn glyph="video" title="Start a video call" disabled />
              <ToolBtn glyph="call" title="Call a contact" disabled />
              <ToolBtn glyph="games" title="Play a game" disabled />
              <ToolBtn glyph="activities" title="Start an activity" disabled />
              <ToolBtn glyph="block" title="Block this contact" disabled />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 8, padding: "2px 10px 8px" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {/* conversation */}
            <div ref={convo} style={{
              flex: 1, minHeight: 0, overflowY: "auto", background: "#fff", borderRadius: 4,
              border: "1px solid #a5bfd8", boxShadow: "inset 0 1px 2px rgba(0,0,0,.08)", padding: "6px 9px",
            }}>
              <div style={{ color: "#6d6d6d", fontSize: 11, borderBottom: "1px solid #e4e9ef", paddingBottom: 5, marginBottom: 6 }}>
                Never give out your password or credit card number in an instant message conversation.
              </div>
              {messages.map((m, i) => m.from === "system" ? (
                <div key={i} style={{ color: "#6d6d6d", margin: "6px 0", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, height: 1, background: "#dfe5ec" }} />{m.lines[0]}<div style={{ flex: 1, height: 1, background: "#dfe5ec" }} />
                </div>
              ) : (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ color: "#6d6d6d" }}>{m.from} says ({time(m.at)}):</div>
                  {m.lines.map((l, j) => (
                    <div key={j} style={{ fontSize: 13, paddingLeft: 12, lineHeight: 1.35, color: m.from === "You" ? "#1e3287" : "#000", wordBreak: "break-word" }}>{l || " "}</div>
                  ))}
                </div>
              ))}
            </div>

            {/* compose */}
            <div style={{ position: "relative", background: "#fff", borderRadius: 4, border: "1px solid #a5bfd8", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 1, padding: "2px 3px", borderBottom: "1px solid #e4e9ef", background: "linear-gradient(#fbfdff,#eef4fb)" }}>
                <ToolBtn glyph="smile" title="Select an emoticon" arrow active={emoji} onClick={() => setEmoji((e) => !e)} />
                <ToolBtn glyph="wink" title="Send a wink" disabled />
                <ToolBtn glyph="nudge" title="Send a nudge" onClick={nudge} />
                <ToolBtn glyph="voice" title="Send a voice clip" disabled />
                <ToolBtn glyph="font" title="Change font" disabled />
                <ToolBtn glyph="background" title="Change your background" disabled />
              </div>
              {emoji && (
                <div style={{
                  position: "absolute", left: 2, bottom: "100%", marginBottom: 2, zIndex: 5, display: "grid",
                  gridTemplateColumns: "repeat(8, 26px)", gap: 2, padding: 6, background: "#fff",
                  border: "1px solid #8ea6c5", borderRadius: 3, boxShadow: "2px 2px 6px rgba(0,0,0,.25)",
                }}>
                  {EMOTICONS.map((e) => (
                    <div key={e} className="wlm-emo" onClick={() => insert(e)} style={{ fontSize: 17, textAlign: "center", lineHeight: "26px", cursor: "pointer", borderRadius: 2 }}>{e}</div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <textarea
                  ref={input}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Type a message…"
                  aria-label="Message"
                  rows={3}
                  style={{
                    flex: 1, minWidth: 0, resize: "none", border: "none", outline: "none", boxShadow: "none",
                    padding: "5px 7px", fontFamily: FONT, fontSize: 13, background: "transparent", height: 60,
                  }}
                />
                <div style={{ display: "flex", alignItems: "flex-end", padding: 6 }}>
                  <button type="button" className={draft.trim() ? "default" : undefined} disabled={!draft.trim()} onClick={send} style={{ minWidth: 64 }}>Send</button>
                </div>
              </div>
            </div>
          </div>

          {/* display pictures */}
          <div className="wlm-side" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", width: 106, flexShrink: 0 }}>
            <DisplayPicture src={AVATAR} size={96} />
            <DisplayPicture size={64} />
          </div>
        </div>

        <div style={{
          height: 22, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 10px", gap: 6,
          borderTop: "1px solid rgba(165,191,216,.7)", background: "rgba(255,255,255,.55)", color: "#4d5d6e", fontSize: 11,
          whiteSpace: "nowrap", overflow: "hidden",
        }}>
          {typing ? (
            <><svg width="14" height="10" viewBox="0 0 14 10"><path d="M1 8l7-7 2 2-7 7H1z" fill="#6b7686" /></svg>Animesh is typing a message...</>
          ) : (
            <>Last message received at {time(lastReceived)} on {date(lastReceived)}.</>
          )}
        </div>
      </div>
    </DraggableWindow>
  );
}
