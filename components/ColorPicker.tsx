"use client";

import { useColorPreference } from "@/contexts/ColorPreferenceContext";
import type { BackgroundColor } from "@/hooks/useColorPreference";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const colorOptions: Array<{
  value: BackgroundColor;
  label: string;
  preview: string;
}> = [
  {
    value: "light-blue",
    label: "Light Blue",
    preview: "bg-blue-600",
  },
  {
    value: "gradient",
    label: "Blue-Violet Gradient",
    preview: "bg-gradient-to-br from-blue-600 to-violet-600",
  },
  {
    value: "yellow",
    label: "Yellow",
    preview: "bg-yellow-600",
  },
  {
    value: "red",
    label: "Red",
    preview: "bg-red-600",
  },
  {
    value: "green",
    label: "Green",
    preview: "bg-green-600",
  },
];

export function ColorPicker() {
  const { color, updateColor } = useColorPreference();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Background Color</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {colorOptions.map((option) => (
            <Button
              key={option.value}
              variant={color === option.value ? "default" : "outline"}
              onClick={() => updateColor(option.value)}
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <div
                className={`w-12 h-12 rounded-md ${option.preview} border-2 ${
                  color === option.value
                    ? "border-primary"
                    : "border-gray-300"
                }`}
              />
              <span className="text-xs">{option.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

