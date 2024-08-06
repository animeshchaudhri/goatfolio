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
      <div
        className="w-96 rounded-t-lg shadow-lg font-sans flex"
        style={{
          background:
            "linear-gradient(to bottom, rgba(50, 123, 165, 0.75), rgba(46, 75, 90, 0.75) 50%, rgba(92, 176, 220, 0.75))",
        }}
      >
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
        <div className="w-1/3 p-2">
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
                className="text-white text-sm p-1 rounded-sm cursor-pointer hover:bg-blue-50 hover:bg-opacity-50"
                onClick={() => handleProgramClick(item)}
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between text-white cursor-pointer rounded-sm">
            <button onClick={onShutdown}>Shut down {">"}</button>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default StartMenu;
