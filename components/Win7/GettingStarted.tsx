"use client";
import React, { useState } from "react";
import type { WindowProps } from "../Desktop/windows";
import { APPS, iconPath } from "../Desktop/apps";
import { FONT } from "./Chrome";
import { CPWindow, Heading, Link, useNarrow, useOpen, CP_BLUE } from "./ControlPanelShell";

// Getting Started, repurposed as a tour of the site: pick a task to read about it, double-click to open it.

const app = (name: string) => iconPath(APPS[name]?.icon);
const ICONS = {
  window: app("Getting started"),
  resume: app("My Resume"),
  projects: app("My Projects"),
  blog: app("My Blog"),
  personalize: app("Personalization"),
  github: "/icons/github.png",
  chat: app("Chat"),
  linkedin: "/icons/linkedin.png",
  doom: app("Doom"),
  help: app("Help and Support"),
  go: "/icons/win7/cp-go.svg",
};

type Task = { title: string; icon: string; desc: string; action: string; to: string };

const TASKS: Task[] = [
  { title: "Get to know Animesh", icon: ICONS.resume, to: "My Resume", action: "Open My Resume",
    desc: "Read Animesh's resume: software engineering at Bajaj Finserv, Google Summer of Code 2024, projects, publications and awards." },
  { title: "See my projects", icon: ICONS.projects, to: "My Projects", action: "Open My Projects",
    desc: "Browse the projects folder: Rustman, Syntropy Labs, DSA Atlas, the Good Morning Image Cleaner and more, with code and live demos." },
  { title: "Read my blog", icon: ICONS.blog, to: "My Blog", action: "Open My Blog",
    desc: "Posts about how this desktop was built, procedural generation with Perlin noise, and whatever else seemed interesting." },
  { title: "Personalize Windows", icon: ICONS.personalize, to: "Personalization", action: "Personalize Windows",
    desc: "Make the desktop yours: pick a theme, change the desktop background, or give the window borders a new color." },
  { title: "Go online to find out what's new", icon: ICONS.github, to: "Github", action: "Visit GitHub",
    desc: "See what Animesh is building right now, including the source code for this desktop." },
  { title: "Contact me", icon: ICONS.chat, to: "Chat", action: "Send a message",
    desc: "Send Animesh a message with Windows Live Messenger, or email hi@animesh.us." },
  { title: "Connect on LinkedIn", icon: ICONS.linkedin, to: "LinkedIn", action: "Open LinkedIn",
    desc: "Find Animesh's professional profile, experience and recommendations on LinkedIn." },
  { title: "Play Doom", icon: ICONS.doom, to: "Doom", action: "Play Doom",
    desc: "Take a break with the 1993 classic, running right in the browser." },
  { title: "Find help and answers", icon: ICONS.help, to: "Help and Support", action: "Open Windows Help and Support",
    desc: "Learn how to use this desktop on a computer or a phone, and find answers about Animesh and the site." },
];

function Body() {
  const open = useOpen();
  const narrow = useNarrow();
  const [sel, setSel] = useState(0);
  const task = TASKS[sel];

  return (
    <>
      <Heading>Get started with Animesh&apos;s PC</Heading>

      {/* details of the selected task */}
      <div style={{
        display: "flex", gap: 16, alignItems: "center", minHeight: 118, padding: "14px 18px", marginBottom: 14,
        flexShrink: 0, borderRadius: 4, border: "1px solid #cbdcee",
        background: "linear-gradient(180deg,#ffffff 0%,#f1f7fd 45%,#dfecf9 100%)",
        boxShadow: "inset 0 1px 0 #fff",
      }}>
        <img src={task.icon} width={narrow ? 48 : 72} height={narrow ? 48 : 72} alt=""
          style={{ flexShrink: 0, objectFit: "contain", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }} />
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontFamily: FONT, fontSize: 15, color: CP_BLUE }}>{task.title}</div>
          <div style={{ color: "#333", lineHeight: 1.45 }}>{task.desc}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <img src={ICONS.go} width={14} height={14} alt="" />
            <Link onClick={() => open(task.to)}>{task.action}</Link>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${narrow ? 2 : 3}, minmax(0, 1fr))`, gap: 4 }}>
        {TASKS.map((t, i) => (
          <div
            key={t.title}
            tabIndex={0}
            className={`cp-tile${i === sel ? " is-selected" : ""}`}
            onClick={() => setSel(i)}
            onDoubleClick={() => open(t.to)}
            onKeyDown={(e) => e.key === "Enter" && open(t.to)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", minHeight: 50, outline: "none" }}
          >
            <img src={t.icon} width={32} height={32} alt="" style={{ flexShrink: 0, objectFit: "contain" }} />
            <span style={{ lineHeight: 1.3 }}>{t.title}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function GettingStarted({ app: self, ...props }: WindowProps) {
  const open = useOpen();
  return (
    <CPWindow
      {...props}
      title={self.title}
      icon={ICONS.window}
      path={["Control Panel", "All Control Panel Items", "Getting Started"]}
      onCrumb={(i) => i <= 1 && open("Control Panel")}
      width="720px"
      height="540px"
    >
      <Body />
    </CPWindow>
  );
}
