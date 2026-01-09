import { useCallback, useEffect } from "react";
import { useBeforeUnload } from "react-router";

export function usePrompt(when, message) {
  useBeforeUnload(
    useCallback(
      (event) => {
        if (when) {
          event.preventDefault();
          event.returnValue = message;
        }
      },
      [when, message]
    ),
    { capture: true }
  );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (when) {
        event.preventDefault();
        event.returnValue = message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [when, message]);
}
