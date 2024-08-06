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
  const ref = useRef<HTMLDivElement>(null);

  const iconWidth = 80;
  const iconHeight = 90;
  const horizontalSpacing = 20;
  const verticalSpacing = 10;

  const calculatePosition = () => {
    const column = Math.floor(props.index / props.maxIconsPerColumn);
    const row = props.index % props.maxIconsPerColumn;

    const x = column * (iconWidth + horizontalSpacing) + 20; // Add 20px left margin
    const y = row * (iconHeight + verticalSpacing) + 20; // Add 20px top margin

    return { x, y };
  };

  const { x, y } = calculatePosition();

  const HighlightIcon = () => {
    setSelected(!selected);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setSelected(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Draggable nodeRef={ref} bounds="parent">
      <div
        style={{ top: y, left: x }}
        onDoubleClick={props.doubleClick}
        onClick={HighlightIcon}
        className={styles.icon}
        ref={ref}
      >
        <div>
          <div
            className={selected ? styles.iconimage_selected : styles.iconimage}
          >
            <Image
              width={45}
              height={45}
              style={{ maxWidth: "100%" }}
              src={props.img}
              alt="icon"
            />
          </div>
        </div>
        <div
          className={selected ? styles.iconlabel_selected : styles.iconlabel}
        >
          <p>{props.title}</p>
        </div>
      </div>
    </Draggable>
  );
};

export default DesktopIcon;
