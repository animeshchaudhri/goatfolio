import { createContext, useContext } from "react";

interface WindowContextValue {
  onMinimize: (e: React.MouseEvent) => void;
  onMaximize: (e: React.MouseEvent) => void;
}

export const WindowContext = createContext<WindowContextValue>({
  onMinimize: () => {},
  onMaximize: () => {},
});

export function useWindowControls() {
  return useContext(WindowContext);
}
