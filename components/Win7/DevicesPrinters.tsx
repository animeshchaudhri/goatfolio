"use client";
import React, { useRef, useState } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { useDesktop } from "../Desktop/DesktopContext";
import type { WindowProps } from "../Desktop/windows";
import { useWindowSize } from "../../hooks/useWindowSize";
import { EXPLORER_CANCEL, FONT, TitleBar, AddressBar, CommandBar, ExplorerBody, DetailsPane, SectionHeader, StatusBar, itemStyle } from "./Chrome";
import { InlineDialog, Instruction, imgIcon } from "./FileView";
import { EXPLORER_ICONS as E } from "./explorerIcons";
import { iconPath } from "../Desktop/apps";

// Win7 Devices and Printers: device groups, wizards for adding hardware, print queue, properties.

const defaultBadge = (base: (size: number) => React.ReactNode) => (size: number) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
    {base(size)}
    <img src={iconPath(E.defaultBadge, size * 0.34)} width={size * 0.34} height={size * 0.34} alt="" style={{ position: "absolute", left: 0, bottom: 0 }} />
  </div>
);

type Device = {
  name: string;
  icon: (size: number) => React.ReactNode;
  category: string;
  manufacturer: string;
  model: string;
  status: string;
  printer?: boolean;
  open?: string;
};

const DEVICES: Device[] = [
  { name: "ANIMESH-PC", icon: imgIcon(E.pc), category: "Desktop computer", manufacturer: "Animesh Chaudhri", model: "goatfolio", status: "Online", open: "Computer" },
  { name: "Generic PnP Monitor", icon: imgIcon(E.monitor), category: "Display", manufacturer: "(Standard monitor types)", model: "Generic PnP Monitor", status: "Connected", open: "Screen Resolution" },
  { name: "HID Keyboard Device", icon: imgIcon(E.keyboard), category: "Keyboard", manufacturer: "(Standard keyboards)", model: "HID Keyboard Device", status: "Connected" },
  { name: "USB Optical Mouse", icon: imgIcon(E.mouse), category: "Mouse", manufacturer: "Microsoft", model: "USB Optical Mouse", status: "Connected" },
];

const PRINTERS: Device[] = [
  { name: "Fax", icon: imgIcon(E.fax), category: "Fax", manufacturer: "Microsoft", model: "Microsoft Shared Fax Driver", status: "0 document(s) in queue", printer: true },
  { name: "Microsoft XPS Document Writer", icon: defaultBadge(imgIcon(E.xpsPrinter)), category: "Printer", manufacturer: "Microsoft", model: "Microsoft XPS Document Writer v4", status: "0 document(s) in queue", printer: true },
];

const ALL = [...DEVICES, ...PRINTERS];

type Dialog = { kind: "addDevice" } | { kind: "addPrinter"; step: 1 | 2 } | { kind: "queue"; device: Device } | { kind: "props"; device: Device };

function ListBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      height: 150, border: "1px solid #828790", background: "#fff", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#5a677c",
    }}>{children}</div>
  );
}

function CommandLink({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex", gap: 8, padding: "8px 10px", marginBottom: 6, borderRadius: 3, cursor: "pointer",
        border: h ? "1px solid #c6c6c6" : "1px solid transparent",
        background: h ? "linear-gradient(180deg,#fdfdfd 0%,#f1f4f8 100%)" : "transparent",
      }}
    >
      <img src={E.commandLink} width={18} height={18} alt="" style={{ flexShrink: 0, marginTop: 1, filter: h ? "brightness(1.15)" : "none" }} />
      <div>
        <div style={{ fontSize: 15, color: h ? "#074ae5" : "#151c55" }}>{title}</div>
        <div style={{ fontSize: 12, color: "#1a1a1a", marginTop: 2 }}>{text}</div>
      </div>
    </div>
  );
}

export default function DevicesPrinters({ onClose, zIndex, onFocus, minimized, onMinimize }: WindowProps) {
  const { openApp } = useDesktop();
  const small = useWindowSize();
  const [sel, setSel] = useState<string | null>(null);
  const [hov, setHov] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [tab, setTab] = useState<"general" | "hardware">("general");
  const last = useRef<{ name: string; t: number } | null>(null);

  const device = ALL.find((d) => d.name === sel) ?? null;
  const q = search.trim().toLowerCase();

  const open = (d: Device) => {
    if (d.open) openApp(d.open);
    else if (d.printer) setDialog({ kind: "queue", device: d });
    else { setTab("general"); setDialog({ kind: "props", device: d }); }
  };

  // Two clicks/taps within 450ms on the same device = double-click
  const click = (e: React.MouseEvent, d: Device) => {
    e.stopPropagation();
    const now = Date.now();
    if (last.current?.name === d.name && now - last.current.t < 450) { last.current = null; open(d); }
    else { last.current = { name: d.name, t: now }; setSel(d.name); }
  };

  const group = (label: string, list: Device[]) => {
    const shown = list.filter((d) => d.name.toLowerCase().includes(q));
    if (!shown.length) return null;
    return (
      <div key={label}>
        <div onClick={(e) => { e.stopPropagation(); setCollapsed((c) => ({ ...c, [label]: !c[label] })); }} style={{ cursor: "default" }}>
          <SectionHeader label={`${label} (${shown.length})`} />
        </div>
        {!collapsed[label] && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "4px 14px 10px" }}>
            {shown.map((d) => (
              <div
                key={d.name}
                onClick={(e) => click(e, d)}
                onMouseEnter={() => setHov(d.name)}
                onMouseLeave={() => setHov(null)}
                style={{
                  width: 104, padding: "6px 3px", borderRadius: 3, display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 4, cursor: "default", boxSizing: "border-box",
                  ...itemStyle(sel === d.name, hov === d.name),
                }}
              >
                {d.icon(64)}
                <div style={{ fontSize: 12, fontFamily: FONT, color: "#000", textAlign: "center", lineHeight: "15px", wordBreak: "break-word" }}>{d.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const commands = [
    { label: "Add a device", onClick: () => setDialog({ kind: "addDevice" }) },
    { label: "Add a printer", onClick: () => setDialog({ kind: "addPrinter", step: 1 }) },
    ...(device?.printer ? [{ label: "See what's printing", onClick: () => setDialog({ kind: "queue", device }) }] : []),
    ...(device ? [{ label: "Properties", onClick: () => { setTab("general"); setDialog({ kind: "props", device }); } }] : []),
    ...(device && device.name !== "ANIMESH-PC" ? [{ label: "Remove device", disabled: true }] : []),
  ];

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
        icon={E.devices}
        path={small ? ["Devices and Printers"] : ["Control Panel", "Hardware and Sound", "Devices and Printers"]}
        searchPlaceholder={small ? undefined : "Search Devices and Printers"}
        search={search}
        onSearch={(v) => { setSearch(v); setSel(null); }}
        onCrumb={(i) => { if (!small && i >= 0 && i < 2) openApp("Control Panel"); }}
      />
      <ExplorerBody>
        <CommandBar commands={commands} showViews={false} />
        <div onClick={() => setSel(null)} style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "#fff", userSelect: "none" }}>
          {group("Devices", DEVICES)}
          {group("Printers and Faxes", PRINTERS)}
          {q && !ALL.some((d) => d.name.toLowerCase().includes(q)) && (
            <div style={{ textAlign: "center", padding: 12, color: "#6d6d6d", fontFamily: FONT, fontSize: 12 }}>No items match your search.</div>
          )}
        </div>
        {device ? (
          <DetailsPane
            icon={device.icon(48)}
            title={device.name}
            subtitle={device.name === "Microsoft XPS Document Writer" ? "Default printer" : undefined}
            props={small ? [] : [
              ["Manufacturer:", device.manufacturer], ["Model:", device.model],
              ["Category:", device.category], ["Status:", device.status],
            ]}
          />
        ) : (
          <DetailsPane icon={imgIcon(E.devices)(48)} title={`${ALL.length} items`} />
        )}
        <StatusBar left={device ? "1 item selected" : `${ALL.length} items`} />

        {dialog?.kind === "addDevice" && (
          <InlineDialog
            title="Add a device"
            icon={E.devices}
            onClose={() => setDialog(null)}
            footer={<>
              <span style={{ marginRight: "auto", color: "#0066cc", cursor: "pointer" }} onClick={() => openApp("Help and Support")}>
                What if Windows doesn&apos;t find my device?
              </span>
              <button disabled>Next</button>
              <button onClick={() => setDialog(null)}>Cancel</button>
            </>}
          >
            <Instruction>Select a device to add to this computer</Instruction>
            <div style={{ marginBottom: 10 }}>Windows will continue to look for new devices and display them here.</div>
            <ListBox>
              <span>Searching for devices...</span>
              <div role="progressbar" className="marquee" style={{ width: 200 }} />
            </ListBox>
          </InlineDialog>
        )}

        {dialog?.kind === "addPrinter" && (
          <InlineDialog
            title="Add Printer"
            icon={E.devices}
            onClose={() => setDialog(null)}
            footer={<>
              {dialog.step === 2 && <button disabled>Next</button>}
              <button onClick={() => setDialog(null)}>Cancel</button>
            </>}
          >
            {dialog.step === 1 ? (
              <>
                <Instruction>What type of printer do you want to install?</Instruction>
                <CommandLink
                  title="Add a local printer"
                  text="Use this option only if you don't have a USB printer. (Windows automatically installs USB printers when you plug them in.)"
                  onClick={() => setDialog({ kind: "addPrinter", step: 2 })}
                />
                <CommandLink
                  title="Add a network, wireless or Bluetooth printer"
                  text="Make sure that your computer is connected to the network, or that your Bluetooth or wireless printer is turned on."
                  onClick={() => setDialog({ kind: "addPrinter", step: 2 })}
                />
              </>
            ) : (
              <>
                <Instruction>Searching for available printers...</Instruction>
                <ListBox>
                  <div role="progressbar" className="marquee" style={{ width: 200 }} />
                </ListBox>
              </>
            )}
          </InlineDialog>
        )}

        {dialog?.kind === "queue" && (
          <InlineDialog title={dialog.device.name} onClose={() => setDialog(null)} width={560}>
            <div style={{ margin: "-14px -20px -18px", fontSize: 12 }}>
              <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", color: "#4c607a", overflow: "hidden" }}>
                {["Document Name", "Status", "Owner", "Pages", "Size", "Submitted"].map((h, i) => (
                  <div key={h} style={{ padding: "4px 8px", width: i === 0 ? 170 : 74, flexShrink: 0, borderRight: "1px solid #e5e5e5" }}>{h}</div>
                ))}
              </div>
              <div style={{ height: 150 }} />
              <div className="status-bar" style={{ margin: 0 }}>
                <p className="status-bar-field" style={{ margin: 0 }}>0 document(s) in queue</p>
              </div>
            </div>
          </InlineDialog>
        )}

        {dialog?.kind === "props" && (
          <InlineDialog
            title={`${dialog.device.name} Properties`}
            onClose={() => setDialog(null)}
            width={400}
            footer={<>
              <button onClick={() => setDialog(null)}>OK</button>
              <button onClick={() => setDialog(null)}>Cancel</button>
            </>}
          >
            <menu role="tablist" style={{ margin: "-4px 0 0" }}>
              <button role="tab" aria-selected={tab === "general"} onClick={() => setTab("general")}>General</button>
              <button role="tab" aria-selected={tab === "hardware"} onClick={() => setTab("hardware")}>Hardware</button>
            </menu>
            <article role="tabpanel" style={{ padding: 12, minHeight: 150 }}>
              {tab === "general" ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    {dialog.device.icon(48)}
                    <span style={{ fontSize: 13 }}>{dialog.device.name}</span>
                  </div>
                  {[["Manufacturer:", dialog.device.manufacturer], ["Model:", dialog.device.model], ["Categories:", dialog.device.category], ["Status:", dialog.device.status]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ width: 90, color: "#5a677c" }}>{k}</span><span>{v}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 4 }}>Device Functions:</div>
                  <div style={{ border: "1px solid #828790", background: "#fff", padding: "3px 6px", marginBottom: 10 }}>
                    {dialog.device.model} <span style={{ color: "#5a677c", float: "right" }}>{dialog.device.category}</span>
                  </div>
                  <fieldset>
                    <legend>Device Function Summary</legend>
                    <div>Manufacturer: {dialog.device.manufacturer}</div>
                    <div>Device status: This device is working properly.</div>
                  </fieldset>
                </>
              )}
            </article>
          </InlineDialog>
        )}
      </ExplorerBody>
    </DraggableWindow>
  );
}
