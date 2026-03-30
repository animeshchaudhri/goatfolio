"use client";
import React, { useRef, useState, useCallback } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import { useWindowSize } from "../../hooks/useWindowSize";
import { WindowContext } from "./WindowContext";
import "react-resizable/css/styles.css";

interface DraggableWindowProps {
  cancelSelector: string;
  zIndex?: number;
  zIndexBase?: number;
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  className?: string;
  onFocus?: () => void;
  minimized?: boolean;
  onMinimize?: () => void;
  children: React.ReactNode;
}

// Parse CSS size string to px number, fallback to default
function toPx(val: string | undefined, fallback: number): number {
  if (!val) return fallback;
  if (val.endsWith("px")) return parseFloat(val);
  if (val.endsWith("vh")) return (parseFloat(val) / 100) * window.innerHeight;
  if (val.endsWith("vw")) return (parseFloat(val) / 100) * window.innerWidth;
  return fallback;
}

function DraggableWindow({
  cancelSelector,
  zIndex = 0,
  zIndexBase = 1000,
  width,
  height,
  maxWidth = "800px",
  maxHeight = "85vh",
  className = "",
  onFocus,
  minimized = false,
  onMinimize,
  children,
}: DraggableWindowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isSmallScreen = useWindowSize();
  const isFixedSize = Boolean(width || height);

  const initW = isFixedSize ? toPx(width, 750) : 600;
  const initH = isFixedSize ? toPx(height, 500) : 400;

  const [size, setSize] = useState({ w: initW, h: initH });
  const [maximized, setMaximized] = useState(false);
  const [preMaxSize, setPreMaxSize] = useState({ w: initW, h: initH });

  const onResize = useCallback((_: React.SyntheticEvent, { size: s }: { size: { width: number; height: number } }) => {
    setSize({ w: s.width, h: s.height });
  }, []);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMinimize?.();
    if (maximized) setMaximized(false);
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!maximized) {
      setPreMaxSize(size);
      setSize({ w: window.innerWidth, h: window.innerHeight - 40 }); // 40px = taskbar
      setMaximized(true);
    } else {
      setSize(preMaxSize);
      setMaximized(false);
    }
  };

  if (isSmallScreen) {
    return (
      <WindowContext.Provider value={{ onMinimize: handleMinimize, onMaximize: handleMaximize }}>
        <div
          className={`absolute ${className}`}
          style={{ top: "2%", left: "5%", width: "50vh", height: "50vh", zIndex: zIndexBase + zIndex, display: "flex", flexDirection: "column", overflow: "hidden" }}
          onMouseDown={onFocus}
        >
          {children}
        </div>
      </WindowContext.Provider>
    );
  }

  return (
    <WindowContext.Provider value={{ onMinimize: handleMinimize, onMaximize: handleMaximize }}>
      <Draggable
        nodeRef={ref as React.RefObject<HTMLElement>}
        bounds="parent"
        defaultClassName=""
        defaultClassNameDragging=""
        defaultClassNameDragged=""
        cancel={cancelSelector}
        scale={1}
        position={maximized ? { x: 0, y: 0 } : undefined}
        defaultPosition={{ x: 0, y: 0 }}
      >
        <div
          ref={ref}
          className="absolute"
          style={{
            top: maximized ? 0 : `${4 + zIndex * 2}%`,
            left: maximized ? 0 : `${15 + zIndex * 3}%`,
            zIndex: zIndexBase + zIndex,
            display: minimized ? "none" : undefined,
          }}
          onMouseDown={onFocus}
        >
          <ResizableBox
            width={size.w}
            height={size.h}
            onResize={onResize}
            minConstraints={[260, 28]}
            maxConstraints={[window.innerWidth, window.innerHeight]}
            resizeHandles={maximized ? [] : ["se", "sw", "ne", "nw", "e", "w", "n", "s"]}
            className={`${className}`}
            style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            <>{children}</>
          </ResizableBox>
        </div>
      </Draggable>
    </WindowContext.Provider>
  );
}

export default DraggableWindow;
