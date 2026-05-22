import { COLOR_MAP, PILL_MAP } from "./data";
import type { InfoProps, PillProps } from "./types";

export const Info = ({ color = "blue", title, children }: InfoProps) => {
  const c = COLOR_MAP[color];
  return (
    <div className={`border rounded-lg p-3 text-xs ${c} mb-3`}>
      {title && <p className="font-bold mb-1">{title}</p>}
      {children}
    </div>
  );
};

export const Pill = ({ color, children }: PillProps) => {
  const c = PILL_MAP[color];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c}`}>
      {children}
    </span>
  );
};
