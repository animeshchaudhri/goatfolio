import React from "react";
import Accordion from "../ui/Accordian";

function Portfolio() {
  return (
    <>
      <div className="flex w-full ">
        <div className=" w-1/3 h-full bg-[linear-gradient(rgb(116,138,255),_rgb(64,87,211))] bg-0 bg-auto bg-repeat bg-scroll bg-padding-box bg-border-box bg-[rgba(0,0,0,0)]">
          <Accordion title="Section 1">
            <p className="text-sm">Content for Section 1</p>
          </Accordion>
          <Accordion title="Section 2">
            <p className="text-sm">Content for Section 2</p>
          </Accordion>
        </div>
        <div>
          <h1>
            {}
            Portfolio Project 1
          </h1>
          <div>image gallery</div>
          <div>description</div>
          <div>tech stack</div>
          <div>github link</div>
          <div>
            <button>View Project</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Portfolio;
