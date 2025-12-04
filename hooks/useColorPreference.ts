import { useState, useEffect } from "react";

export type BackgroundColor = 
  | "light-blue"
  | "gradient"
  | "yellow"
  | "red"
  | "green";

const COLOR_STORAGE_KEY = "background-color-preference";
const DEFAULT_COLOR: BackgroundColor = "light-blue";

const colorClasses: Record<BackgroundColor, string> = {
  "light-blue": "bg-blue-100",
  "gradient": "bg-gradient-to-br from-blue-600 to-violet-600",
  "yellow": "bg-yellow-100",
  "red": "bg-red-100",
  "green": "bg-green-100",
};

export function useColorPreference() {
  const [color, setColor] = useState<BackgroundColor>(DEFAULT_COLOR);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount (client-side only)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(COLOR_STORAGE_KEY) as BackgroundColor;
      if (stored && colorClasses[stored]) {
        setColor(stored);
      }
    }
    setIsLoading(false);
  }, []);

  const updateColor = (newColor: BackgroundColor) => {
    setColor(newColor);
    if (typeof window !== "undefined") {
      localStorage.setItem(COLOR_STORAGE_KEY, newColor);
    }
  };

  const getColorClass = () => colorClasses[color];

  return {
    color,
    colorClass: getColorClass(),
    updateColor,
    isLoading,
  };
}

