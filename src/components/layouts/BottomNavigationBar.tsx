import React from "react";

interface NavButton {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BottomNavigationBarProps {
  buttons: NavButton[];
}

export default function BottomNavigationBar({ buttons }: BottomNavigationBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-accent md:hidden">
      <div className="flex justify-around items-center px-4 py-2">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            className={`flex flex-col items-center text-sm transition-colors ${
              btn.isActive ? "text-title font-semibold " : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {btn.icon}
            <span className="mt-1">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
