

import "7.css/dist/7.css";
function Topbar({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <>
      <div className="window active">
        <div className="title-bar">
          <div className="title-bar-text">{title}</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Maximize"></button>
            <button
              aria-label="Close"
              className="custom-gradient"
              onClick={onClose}
            ></button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Topbar;
