"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BackgroundColor } from "@/hooks/useColorPreference";

const COLOR_STORAGE_KEY = "background-color-preference";
const DEFAULT_COLOR: BackgroundColor = "light-blue";

const colorClasses: Record<BackgroundColor, string> = {
  "light-blue": "bg-blue-100",
  "gradient": "bg-gradient-to-br from-blue-600 to-violet-600",
  "yellow": "bg-yellow-100",
  "red": "bg-red-100",
  "green": "bg-green-100",
};

interface ColorPreferenceContextType {
  color: BackgroundColor;
  colorClass: string;
  updateColor: (newColor: BackgroundColor) => void;
  isLoading: boolean;
}

const ColorPreferenceContext = createContext<ColorPreferenceContextType | undefined>(undefined);

export function ColorPreferenceProvider({ children }: { children: React.ReactNode }) {
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

  const colorClass = colorClasses[color];

  return (
    <ColorPreferenceContext.Provider
      value={{
        color,
        colorClass,
        updateColor,
        isLoading,
      }}
    >
      {children}
    </ColorPreferenceContext.Provider>
  );
}

export function useColorPreference() {
  const context = useContext(ColorPreferenceContext);
  if (context === undefined) {
    throw new Error("useColorPreference must be used within a ColorPreferenceProvider");
  }
  return context;
}

