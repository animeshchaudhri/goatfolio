import React from "react";
import Image from "next/image";

interface MenuItem {
  label: string;
  disabled?: boolean;
  hasDivider?: boolean;
  icon?: string;
  subMenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { label: "View" },
  {
    label: "Sort by",
    subMenu: [
      { label: "Name" },
      { label: "Size" },
      { label: "Item type" },
      { label: "Date modified" },
    ],
  },
  { label: "Refresh", hasDivider: true },
  { label: "Paste", disabled: true },
  { label: "Paste shortcut", disabled: true, hasDivider: true },
  {
    label: "Screen resolution",
    icon: "https://img.icons8.com/color/18/000000/monitor--v1.png",
  },
  {
    label: "Gadgets",
    icon: "https://img.icons8.com/color/18/000000/virtual-machine2.png",
  },
  {
    label: "Personalize",
    icon: "https://img.icons8.com/color/18/000000/remote-desktop.png",
  },
];

const MenuItem: React.FC<{ item: MenuItem }> = ({ item }) => {
  return (
    <li
      role="menuitem"
      tabIndex={item.disabled ? -1 : 0}
      aria-haspopup={item.subMenu ? "true" : undefined}
      aria-disabled={item.disabled ? "true" : undefined}
      className={`${item.hasDivider ? "has-divider" : ""} ${
        item.disabled ? "opacity-50" : ""
      }`}
    >
      {item.icon && (
        <Image src={item.icon} alt="" width={18} height={18} className="mr-2" />
      )}
      <span>{item.label}</span>
      {item.subMenu && (
        <ul role="menu">
          {item.subMenu.map((subItem, index) => (
            <MenuItem key={index} item={subItem} />
          ))}
        </ul>
      )}
    </li>
  );
};

const RightClick: React.FC = () => {
  return (
    <div>
      <ul role="menu" className="can-hover" style={{ width: "200px" }}>
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </ul>
    </div>
  );
};

export default RightClick;
