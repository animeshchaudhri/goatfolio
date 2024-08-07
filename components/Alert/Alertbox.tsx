import React from "react";
import Topbar from "../Browser/Topbar";

function Alertbox({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="window active is-bright">
        <div className="title-bar">
          <div className="title-bar-text" id="dialog-title">
            Shutdown Alert
          </div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={() => history.back()}></button>
          </div>
        </div>
        <div className="window-body has-space">
          <h2 className="instruction instruction-primary">
            Shuting down your computer...
          </h2>
          <div role="progressbar" className="marquee"></div>
        </div>
        <footer style={{ textAlign: "right" }}>
          <button onClick={() => history.back()}>Cancel</button>
        </footer>
      </div>
    </div>
  );
}

export default Alertbox;
