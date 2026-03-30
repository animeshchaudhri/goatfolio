import { useWindowControls } from "../DraggableWindow/WindowContext";
import "7.css/dist/7.css";

function Topbar({ title, onClose }: { title: string; onClose: () => void }) {
  const { onMinimize, onMaximize } = useWindowControls();
  return (
    <>
      <div className="title-bar">
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button
            aria-label="Close"
            className="custom-gradient"
            onClick={onClose}
          ></button>
        </div>
      </div>
    </>
  );
}

export default Topbar;
