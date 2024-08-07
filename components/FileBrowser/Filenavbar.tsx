import React from "react";

const SpriteIcon = ({
  name,
  className,
}: {
  name: string;
  className: string;
}) => {
  const getIconPosition = () => {
    switch (name) {
      case "chevron-left":
        return "-0px -0px";
      case "chevron-right":
        return "-64px -0px";
      case "chevron-down":
        return "-84px -24px";
      case "chevron-up":
        return "0 -24px";
      case "folder":
        return "-72px -96px";
      case "chevron-small-right":
        return "-48px -24px";
      default:
        return "0 0";
    }
  };
  const geticondWidth = () => {
    switch (name) {
      case "chevron-left":
        return "32px";
      case "chevron-right":
        return "32px";
      case "chevron-down":
        return "18px";
      case "chevron-up":
        return "24px";
      case "folder":
        return "24px";
      default:
        return "32px";
      case "chevron-small-right":
        return "16px";
    }
  };

  return (
    <div
      className={`inline-block w-5 h-5 bg-no-repeat ${className}`}
      style={{
        backgroundImage: 'url("/icons/Sprite.png")',
        backgroundPosition: getIconPosition(),
        width: geticondWidth(),
      }}
    />
  );
};

function Filenavbar() {
  return (
    <>
      <div className="flex items-center p-2 border-b border-gray-300">
        <SpriteIcon name="chevron-left" className="" />

        <SpriteIcon name="chevron-right" className="" />
        <SpriteIcon name="chevron-down" className="" />
        <SpriteIcon name="chevron-up" className="" />

        <div className="flex items-center border border-gray-300 rounded px-2 py-1 flex-grow">
          <SpriteIcon name="folder" className="mr-2" />
          <span className="text-sm">Home</span>
          <SpriteIcon name="chevron-small-right" className="" />
        </div>
      </div>
    </>
  );
}

export default Filenavbar;
