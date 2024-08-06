import React from "react";
import ClientClock from "./Clock";

function ServerClock() {
  return (
    <>
      <div className="flex flex-col items-center ml-0.5 mr-2 leading-[18px] text-white select-none">
        <ClientClock />
      </div>
    </>
  );
}

export default ServerClock;
