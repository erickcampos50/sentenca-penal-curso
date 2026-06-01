import { COLOR_MAP, PILL_MAP } from "./data";
import type { InfoProps, PillProps } from "./types";

export const Info = ({ color = "blue", title, children }: InfoProps) => {
  const c = COLOR_MAP[color];
  return (
    <div className={`border rounded-lg p-4 text-sm leading-relaxed ${c}`}>
      {title && <p className="font-extrabold mb-1.5">{title}</p>}
      {children}
    </div>
  );
};

export const Pill = ({ color, children }: PillProps) => {
  const c = PILL_MAP[color];
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${c}`}>
      {children}
    </span>
  );
};
