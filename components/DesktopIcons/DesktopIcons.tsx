"use client";
import React, { useEffect, useRef } from "react";
import styles from "./Helper.module.css";
import { ICONS } from "./icons";
import type { DesktopItem, IconSize, Metrics } from "./desktopModel";

// One desktop icon. Selection, dragging and opening are driven by DesktopSurface.

interface DesktopIconProps {
  item: DesktopItem;
  x: number;
  y: number;
  size: IconSize;
  metrics: Metrics;
  selected?: boolean;
  /** Translucent copy that follows the pointer while dragging */
  ghost?: boolean;
  renaming?: boolean;
  onRename?: (name: string | null) => void;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onDoubleClick?: () => void;
}

function RenameBox({ value, small, onDone }: { value: string; small: boolean; onDone: (name: string | null) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const done = useRef(false);
  const finish = (name: string | null) => {
    if (done.current) return;
    done.current = true;
    onDone(name);
  };
  const fit = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.select();
    fit();
  }, []);
  return (
    <textarea
      ref={ref}
      className={small ? `${styles.rename} ${styles.renameSmall}` : styles.rename}
      defaultValue={value}
      spellCheck={false}
      rows={1}
      onInput={fit}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") { e.preventDefault(); finish(e.currentTarget.value); }
        if (e.key === "Escape") { e.preventDefault(); finish(null); }
      }}
      onBlur={(e) => finish(e.currentTarget.value)}
    />
  );
}

const DesktopIcon: React.FC<DesktopIconProps> = ({
  item, x, y, size, metrics, selected, ghost, renaming, onRename,
  onPointerDown, onPointerMove, onPointerUp, onDoubleClick,
}) => {
  const small = size === "small";
  const overlay = Math.round(metrics.icon * (small ? 0.6 : 0.36));
  return (
    <div
      data-icon-id={ghost ? undefined : item.id}
      className={`${styles.icon} ${small ? styles.small : ""} ${ghost ? styles.ghost : ""}`}
      style={{ left: x, top: y, width: metrics.cellW }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
    >
      <div
        data-icon-box=""
        className={`${styles.box} ${selected ? styles.selected : ""}`}
        style={{ width: metrics.boxW }}
      >
        <div className={styles.image} style={{ width: metrics.icon, height: metrics.icon }}>
          <img src={item.img} width={metrics.icon} height={metrics.icon} alt="" draggable={false} />
          {item.overlay && (
            <img
              className={styles.overlay}
              src={ICONS.shortcutOverlay}
              width={overlay}
              height={overlay}
              alt=""
              draggable={false}
            />
          )}
        </div>
        {renaming && onRename ? (
          <RenameBox value={item.title} small={small} onDone={onRename} />
        ) : (
          <div className={`${styles.label} ${selected ? styles.labelFull : ""}`}>{item.title}</div>
        )}
      </div>
    </div>
  );
};

export default DesktopIcon;
