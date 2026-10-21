"use client";
import React, { useState } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { useDesktop } from "../Desktop/DesktopContext";
import type { WindowProps } from "../Desktop/windows";
import { useWindowSize } from "../../hooks/useWindowSize";
import { EXPLORER_CANCEL, FONT, TitleBar, AddressBar, CommandBar, ExplorerBody, DetailsPane, StatusBar, type ViewMode } from "./Chrome";
import { ItemsView, InlineDialog, Instruction, imgIcon, type FileItem } from "./FileView";
import { locationApp } from "./Library";
import { EXPLORER_ICONS as E } from "./explorerIcons";
import { iconPath } from "../Desktop/apps";

// Win7 Games Explorer: game tiles, rating/performance preview pane, details pane.

// Box art at any size; Win7 shows it with a soft shadow above 32px
const boxArt = (src: string) => (size: number) => (
  <div style={{ width: size, height: size, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <img src={iconPath(src, size)} width={size} height={size} alt="" draggable={false}
      style={{ borderRadius: size > 32 ? 6 : 0, boxShadow: size > 32 ? "0 1px 4px rgba(0,0,0,0.45)" : "none" }} />
  </div>
);

type Game = {
  name: string;
  art: (size: number) => React.ReactNode;
  rating: { letter: string; label: string; descriptors: string };
  required: string; recommended: string;
  publisher: string; developer: string; version: string; released: string;
  play: (openApp: (t: string) => void) => void;
};

const GAMES: Game[] = [
  {
    name: "Doom", art: boxArt(E.doom),
    rating: { letter: "M", label: "MATURE 17+", descriptors: "Blood and Gore, Intense Violence" },
    required: "1.0", recommended: "2.0",
    publisher: "id Software", developer: "id Software", version: "1.9", released: "12/10/1993",
    play: (openApp) => openApp("Doom"),
  },
  {
    name: "Purble Place", art: boxArt(E.purblePlace),
    rating: { letter: "E", label: "EVERYONE", descriptors: "No descriptors" },
    required: "1.0", recommended: "3.0",
    publisher: "Animesh Chaudhri", developer: "Animesh Chaudhri", version: "Reimagined (React, PixiJS)", released: "2024",
    // No hosted build: the reimagined game lives in its GitHub repo
    play: () => window.open("https://github.com/animeshchaudhri/purble", "_blank"),
  },
];

const SYSTEM_SCORE = "5.9";

function RatingBox({ game }: { game: Game }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <div style={{
        width: 46, flexShrink: 0, background: "#fff", border: "2px solid #000",
        display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "Arial,sans-serif",
      }}>
        <div style={{ fontSize: 30, fontWeight: 900, lineHeight: "34px", color: "#000" }}>{game.rating.letter}</div>
        <div style={{ width: "100%", background: "#000", color: "#fff", fontSize: 6.5, textAlign: "center", padding: "2px 0", fontWeight: 700 }}>
          CONTENT RATED
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "#1a1a1a", lineHeight: "16px" }}>
        <div style={{ fontWeight: 700 }}>{game.rating.label}</div>
        <div style={{ color: "#5a677c" }}>{game.rating.descriptors}</div>
      </div>
    </div>
  );
}

function PerformanceBox({ game }: { game: Game }) {
  const row = (k: string, v: string, strong?: boolean) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid #eef2f7" }}>
      <span style={{ color: "#5a677c" }}>{k}</span>
      <span style={{ fontWeight: strong ? 700 : 400, color: "#1a1a1a" }}>{v}</span>
    </div>
  );
  return (
    <div style={{ fontSize: 11.5 }}>
      <div style={{ color: "#1e395b", marginBottom: 4 }}>Windows Experience Index</div>
      {row("Required rating:", game.required)}
      {row("Recommended rating:", game.recommended)}
      {row("Your system:", SYSTEM_SCORE, true)}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, color: "#1a1a1a" }}>
        <img src={iconPath(E.defaultBadge, 14)} width={14} height={14} alt="" />
        Your computer meets the recommended rating
      </div>
    </div>
  );
}

function PreviewPane({ game }: { game: Game | null }) {
  const [tab, setTab] = useState<"rating" | "performance">("rating");
  return (
    <div style={{
      width: 230, flexShrink: 0, borderLeft: "1px solid #d6e0ea", background: "#fff",
      overflowY: "auto", padding: "14px 14px", fontFamily: FONT, fontSize: 12,
    }}>
      {game ? (
        <>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>{game.art(128)}</div>
          <menu role="tablist" style={{ margin: 0 }}>
            <button role="tab" aria-selected={tab === "rating"} onClick={() => setTab("rating")}>Rating</button>
            <button role="tab" aria-selected={tab === "performance"} onClick={() => setTab("performance")}>Performance</button>
          </menu>
          <article role="tabpanel" style={{ padding: 10 }}>
            {tab === "rating" ? <RatingBox game={game} /> : <PerformanceBox game={game} />}
          </article>
        </>
      ) : (
        <div style={{ textAlign: "center", color: "#5a677c", marginTop: 30 }}>
          <img src={iconPath(E.games, 96)} width={96} height={96} alt="" />
          <div style={{ marginTop: 8 }}>Select a game to see its rating and performance information.</div>
        </div>
      )}
    </div>
  );
}

export default function Games({ onClose, zIndex, onFocus, minimized, onMinimize }: WindowProps) {
  const { openApp } = useDesktop();
  const small = useWindowSize();
  const [sel, setSel] = useState<number | null>(null);
  const [view, setView] = useState<ViewMode>("large");
  const [search, setSearch] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [lastPlayed, setLastPlayed] = useState<Record<string, string>>({});
  const [options, setOptions] = useState(false);
  const [settings, setSettings] = useState({ news: true, art: true, updates: false, recent: true });

  const q = search.trim().toLowerCase();
  const games = GAMES.filter((g) => g.name.toLowerCase().includes(q));
  const game = sel !== null ? games[sel] ?? null : null;

  const play = (g: Game) => {
    setLastPlayed((s) => ({ ...s, [g.name]: new Date().toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }) }));
    g.play(openApp);
  };

  const items: FileItem[] = games.map((g) => ({
    name: g.name, icon: g.art, type: "Game", onOpen: () => play(g),
  }));

  return (
    <DraggableWindow
      cancelSelector={EXPLORER_CANCEL}
      zIndex={zIndex}
      width="780px"
      height="520px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active"
    >
      <TitleBar title="" onClose={onClose} />
      <AddressBar
        icon={E.games}
        path={["Games"]}
        searchPlaceholder={small ? undefined : "Search Games"}
        search={search}
        onSearch={(v) => { setSearch(v); setSel(null); }}
        onCrumb={(i) => i < 0 && openApp(locationApp("Desktop"))}
      />
      <ExplorerBody>
        <CommandBar
          view={view}
          onViewChange={setView}
          commands={[
            {
              label: "Organize",
              menu: [
                { label: "Details pane", checked: showDetails, onClick: () => setShowDetails((v) => !v) },
                { label: "Preview pane", checked: showPreview, onClick: () => setShowPreview((v) => !v), divider: true },
                { label: "Close", onClick: onClose },
              ],
            },
            ...(game ? [{ label: "Play", onClick: () => play(game) }] : []),
            { label: "Options", onClick: () => setOptions(true) },
            {
              label: "Tools",
              menu: [
                { label: "Hardware", onClick: () => openApp("Devices and Printers") },
                { label: "Audio Devices", onClick: () => openApp("Sound Settings") },
                { label: "Input Devices", onClick: () => openApp("Devices and Printers") },
                { label: "Display Devices", onClick: () => openApp("Screen Resolution"), divider: true },
                { label: "Programs and Features", onClick: () => openApp("Default Programs") },
              ],
            },
          ]}
        />
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          <ItemsView
            items={items}
            view={view}
            selected={sel}
            onSelect={setSel}
            emptyText="No items match your search."
          />
          {showPreview && !small && <PreviewPane game={game} />}
        </div>
        {showDetails && (game ? (
          <DetailsPane
            icon={game.art(48)}
            title={game.name}
            subtitle="Game"
            props={small ? [] : [
              ["Publisher:", game.publisher], ["Developer:", game.developer],
              ["Product version:", game.version], ["Release date:", game.released],
              ["Last played:", lastPlayed[game.name] ?? "Never"],
            ]}
          />
        ) : (
          <DetailsPane icon={imgIcon(E.games)(48)} title={`${games.length} items`} />
        ))}
        <StatusBar left={game ? "1 item selected" : `${games.length} items`} />

        {options && (
          <InlineDialog
            title="Set Up Games"
            icon={E.games}
            onClose={() => setOptions(false)}
            width={440}
            footer={<>
              <button onClick={() => setOptions(false)}>OK</button>
              <button onClick={() => setOptions(false)}>Cancel</button>
            </>}
          >
            <Instruction>Keep your games folder up to date</Instruction>
            {([
              ["news", "Download news and information about installed games"],
              ["art", "Download art and information about installed games"],
              ["updates", "Check online for updates to installed games and notify me"],
              ["recent", "List most recently played games"],
            ] as const).map(([k, text]) => (
              <div key={k} style={{ marginBottom: 6 }}>
                <input type="checkbox" id={`gs-${k}`} checked={settings[k]}
                  onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.checked }))} />
                <label htmlFor={`gs-${k}`}>{text}</label>
              </div>
            ))}
          </InlineDialog>
        )}
      </ExplorerBody>
    </DraggableWindow>
  );
}
