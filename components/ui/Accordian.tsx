import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const Accordion = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-5">
      <div
        className="flex items-center justify-between rounded-t-md px-2.5 h-7.5 cursor-pointer bg-[linear-gradient(90deg,_rgb(240,240,255)_0%,_rgb(240,240,255)_30%,_rgb(168,188,255))]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[#0c327d] text-xs font-bold">{title}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {isOpen && (
        <div className="p-2 bg-[linear-gradient(90deg,_rgb(180,200,251)_0%,_rgb(164,185,251)_50%,_rgb(180,200,251))] bg-0 bg-auto bg-repeat bg-scroll bg-padding-box bg-border-box bg-[rgba(198,211,255,0.87)] bg-opacity-87 animate-slideDown">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
