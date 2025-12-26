import { useRef, useCallback } from "react";

export function useStudioSave() {
  const dirtyRef = useRef(false);
  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);
  const isDirty = useCallback(() => dirtyRef.current, []);
  const clearDirty = useCallback(() => {
    dirtyRef.current = false;
  }, []);

  return { markDirty, isDirty, clearDirty };
}
