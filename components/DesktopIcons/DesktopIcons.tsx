import { StaticImageData } from "next/image";
import { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import styles from "./Helper.module.css";
import Image from "next/image";

interface DesktopIconProps {
  title: string;
  img: string | StaticImageData;
  index: number;
  maxIconsPerColumn: number;
  doubleClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = (props) => {
  const [selected, setSelected] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const iconWidth = 80;
  const iconHeight = 90;
  const horizontalSpacing = 20;
  const verticalSpacing = 10;

  const calculatePosition = () => {
    const column = Math.floor(props.index / props.maxIconsPerColumn);
    const row = props.index % props.maxIconsPerColumn;

    const x = column * (iconWidth + horizontalSpacing) + 5; // Add 20px left margin
    const y = row * (iconHeight + verticalSpacing) + 20; // Add 20px top margin

    return { x, y };
  };

  const { x, y } = calculatePosition();
  const HighlightIcon = () => {
    setSelected(!selected);
  };

  const handleTap = (event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (event.type === 'touchstart') {
      // Handle mobile touch events
      if (tapLength < 300 && tapLength > 0) {
        props.doubleClick();
        setLastTap(0);
      } else {
        setLastTap(currentTime);
        HighlightIcon();
      }
    } else {
      // Handle desktop click events
      if (event.type === 'dblclick') {
        props.doubleClick();
      } else {
        HighlightIcon();
      }
    }
  };

  const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setSelected(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  return (
    <Draggable 
      nodeRef={ref} 
      bounds="parent"
      defaultClassName=""
      defaultClassNameDragging=""
      defaultClassNameDragged=""
    >
      <div
        style={{ top: y, left: x }}
        onDoubleClick={(e) => {
          e.preventDefault();
          props.doubleClick();
        }}
        onClick={(e) => {
          if (e.detail === 1) { // Only handle single clicks
            handleTap(e);
          }
        }}
        onTouchStart={handleTap}
        className={`${styles.icon} touch-manipulation`}
        ref={ref}
      >
        <div className="flex flex-col items-center">
          <div
            className={selected ? styles.iconimage_selected : styles.iconimage }
          >
            <Image
              width={45}
              height={45}
              style={{ maxWidth: "100%" }}
              src={props.img}
              alt="icon"
            />
          </div>
          <div
          className={selected ? styles.iconlabel_selected : styles.iconlabel}
        >
          <p>{props.title}</p>
        </div>
        </div>
        
      </div>
    </Draggable>
  );
};

export default DesktopIcon;
