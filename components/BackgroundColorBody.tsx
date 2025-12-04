"use client";

import { useColorPreference } from "@/contexts/ColorPreferenceContext";
import { Inter } from "next/font/google";

interface BackgroundColorBodyProps {
  children: React.ReactNode;
  inter: ReturnType<typeof Inter>;
}

export function BackgroundColorBody({ children, inter }: BackgroundColorBodyProps) {
  const { colorClass } = useColorPreference();

  return (
    <body className={`${inter.className} ${colorClass} min-h-screen`}>
      {children}
    </body>
  );
}

