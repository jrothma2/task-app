"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { BackgroundColor } from "@/hooks/useColorPreference";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserClient } from "@supabase/ssr";

const COLOR_STORAGE_KEY = "background-color-preference";
const DEFAULT_COLOR: BackgroundColor = "light-blue";

const colorClasses: Record<BackgroundColor, string> = {
  "light-blue": "bg-blue-600",
  "gradient": "bg-gradient-to-br from-blue-600 to-violet-600",
  "yellow": "bg-yellow-600",
  "red": "bg-red-600",
  "green": "bg-green-600",
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
  const { isLoggedIn, user, isLoading: authLoading } = useAuth();
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  // Load color preference from Supabase when user is logged in, otherwise from localStorage
  useEffect(() => {
    const loadColorPreference = async () => {
      if (authLoading) return;

      if (isLoggedIn && user?.user_id) {
        // Load from Supabase profile
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("background_color")
            .eq("user_id", user.user_id)
            .single();

          if (!error && data?.background_color && colorClasses[data.background_color as BackgroundColor]) {
            setColor(data.background_color as BackgroundColor);
          } else {
            // If no color in database, use default or localStorage fallback
            if (typeof window !== "undefined") {
              const stored = localStorage.getItem(COLOR_STORAGE_KEY) as BackgroundColor;
              if (stored && colorClasses[stored]) {
                setColor(stored);
                // Save to database for future use
                await supabase
                  .from("profiles")
                  .update({ background_color: stored })
                  .eq("user_id", user.user_id);
              }
            }
          }
        } catch (error) {
          console.error("Error loading color preference from Supabase:", error);
          // Fallback to localStorage
          if (typeof window !== "undefined") {
            const stored = localStorage.getItem(COLOR_STORAGE_KEY) as BackgroundColor;
            if (stored && colorClasses[stored]) {
              setColor(stored);
            }
          }
        }
      } else {
        // Not logged in, load from localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(COLOR_STORAGE_KEY) as BackgroundColor;
          if (stored && colorClasses[stored]) {
            setColor(stored);
          }
        }
      }
      setIsLoading(false);
    };

    loadColorPreference();
  }, [isLoggedIn, user?.user_id, authLoading, supabase]);

  const updateColor = async (newColor: BackgroundColor) => {
    setColor(newColor);
    
    // Save to localStorage as fallback
    if (typeof window !== "undefined") {
      localStorage.setItem(COLOR_STORAGE_KEY, newColor);
    }

    // Save to Supabase if user is logged in
    if (isLoggedIn && user?.user_id) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ background_color: newColor })
          .eq("user_id", user.user_id);

        if (error) {
          console.error("Error saving color preference to Supabase:", error);
        }
      } catch (error) {
        console.error("Error saving color preference to Supabase:", error);
      }
    }
  };

  const colorClass = colorClasses[color];

  return (
    <ColorPreferenceContext.Provider
      value={{
        color,
        colorClass,
        updateColor,
        isLoading: isLoading || authLoading,
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

