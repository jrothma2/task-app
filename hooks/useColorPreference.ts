export type BackgroundColor = 
  | "light-blue"
  | "gradient"
  | "yellow"
  | "red"
  | "green";

// Re-export the hook from the context
export { useColorPreference } from "@/contexts/ColorPreferenceContext";

