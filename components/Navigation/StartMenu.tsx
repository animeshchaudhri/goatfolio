import React from "react";
import "7.css/dist/7.css";
import { Search, ChevronRight, Power } from "lucide-react";
import Image from "next/image";
import { programs } from "../Icons";

interface StartMenuProps {
  onShareLink: () => void;
  onChangeWallpaper: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onShutdown: () => void;
  onProgramClick: (programName: string) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({
  onShareLink,
  onChangeWallpaper,
  onShutdown,
  onProgramClick,
}) => {
  const handleProgramClick = (programName: string) => {
    onProgramClick(programName);
  };

  return (
    <>
      <div className="w-[25rem] rounded-t-lg  font-sans flex bg-glassy shadow-[rgba(255,255,255,0.333)_0px_0px_0px_1px_inset]">
        {/* Left column - Programs */}
        <div className="w-2/3 bg-white bg-opacity-90 rounded-sm mr-2">
          <ul className="space-y-2">
            {programs.map((program, index) => (
              <li
                key={index}
                className="text-black text-sm hover:bg-blue-100 p-1 rounded-sm cursor-pointer flex items-center"
                onClick={() => handleProgramClick(program.name)}
              >
                <Image
                  src={`/${program.icon}`}
                  alt={program.name}
                  width={24}
                  height={24}
                  className="mr-2"
                />
                {program.name}
              </li>
            ))}
          </ul>
          <div
            className="mt-2 text-sm text-black p-1 rounded-sm cursor-pointer flex items-center"
            onClick={() => handleProgramClick("All Programs")}
          >
            <span className="mr-2">▶</span>
            All Programs
          </div>

          {/* Search bar */}
          <div className="mt-2 border border-gray-300 rounded-sm p-1 flex items-center">
            <input
              type="text"
              placeholder="Search programs and files"
              className="bg-transparent outline-none text-sm w-full"
            />
            <Search className="text-gray-400" size={16} />
          </div>
        </div>

        {/* Right column - User menu */}
        <div className="w-[40%] p-2">
          <ul className="space-y-1">
            {[
              "Documents",
              "Pictures",
              "Music",
              "Games",
              "Computer",
              "Control Panel",
              "Devices and Printers",
              "Default Programs",
              "Help and Support",
            ].map((item, index) => (
              <li
                key={index}
                className="text-white text-sm p-1 rounded-sm cursor-pointer hover:bg-[linear-gradient(90deg,rgba(0,0,0,0.1),rgba(255,255,255,0.2)_40%,rgba(255,255,255,0.2)_60%,rgba(0,0,0,0.1)),linear-gradient(rgba(255,255,255,0.2),rgba(255,255,255,0.1)_48%,rgba(0,0,0,0.4)_50%,transparent_98%)] hover:border-[1px_solid_rgba(0,0,0,0.667)] hover:shadow-[rgba(255,255,255,0.333)_0px_0px_0px_1px_inset,rgba(255,255,255,0.2)_0px_0px_0px_1px]"
                onClick={() => handleProgramClick(item)}
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex ">
            <button
              className="bg-button-gradient text-xs text-white min-w-5 shadow-[rgba(255,255,255,0.667)_0px_0px_0px_1px_inset] rounded-[3px_0px_0px_3px]"
              onClick={onShutdown}
            >
              Shut down
            </button>
            <button className="bg-button-gradient min-w-4 p-1 text-white shadow-[rgba(255,255,255,0.667)_0px_0px_0px_1px_inset] rounded-[0px_3px_3px_0px]">
              {">"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StartMenu;
