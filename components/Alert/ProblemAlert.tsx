import React from "react";

function ProblemAlert({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="inline-block w-80 bg-white rounded-md shadow-lg window active is-bright">
        <div className="title-bar">
          <div className="title-bar-text" id="dialog-title">
            Problem Diagnostics
          </div>
          <div className="title-bar-controls">
            <button aria-label="Close" disabled></button>
          </div>
        </div>
        <div className="p-4 window-body">
          <h2 className="instruction instruction-primary">{title}</h2>
          <div role="progressbar" className="marquee"></div>
          <div className="text-right mt-3">
            <button disabled> Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemAlert;
