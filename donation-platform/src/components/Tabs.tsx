"use client";
import { useState } from "react";

export default function Tabs({
  tabs,
  children,
}: {
  tabs: string[];
  children: React.ReactNode[];
}) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex gap-2">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-md text-sm border ${
              active === i ? "bg-rose-600 text-white border-rose-600" : "bg-white hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-4">{children[active]}</div>
    </div>
  );
}
