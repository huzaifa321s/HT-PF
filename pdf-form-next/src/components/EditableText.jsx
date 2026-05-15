"use client";
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Typography } from "@mui/material";

/**
 * A robust wrapper for contentEditable fields in React.
 * Fixes the "cursor jumping to start" and "reversing text" bugs by
 * managing the text uncontrolled during active focus,
 * and only syncing from props when the element is NOT focused.
 *
 * useHtml=true  → syncs via innerHTML (preserves bold/italic/underline tags)
 * useHtml=false → syncs via innerText (plain text only, default)
 *
 * Supports ref forwarding so parent components can access the DOM node directly.
 */
const EditableText = forwardRef(function EditableText(
  {
    value,
    onInput,
    onChange,
    component = "div",
    isStudioMode = true,
    fallback = "",
    useHtml = false,
    sx = {},
    ...props
  },
  forwardedRef
) {
  const elementRef = useRef(null);
  const isFocused = useRef(false);

  // Expose the underlying DOM node via the forwarded ref
  useImperativeHandle(forwardedRef, () => elementRef.current, []);

  useEffect(() => {
    if (elementRef.current && !isFocused.current) {
      const displayValue = value || fallback;
      if (useHtml) {
        if (elementRef.current.innerHTML !== displayValue) {
          elementRef.current.innerHTML = displayValue;
        }
      } else {
        if (elementRef.current.innerText !== displayValue) {
          elementRef.current.innerText = displayValue;
        }
      }
    }
  }, [value, fallback, useHtml]);

  const handleInput = (e) => {
    if (onInput) onInput(e);
  };

  const handleFocus = () => {
    isFocused.current = true;
  };

  const handleBlur = (e) => {
    isFocused.current = false;
    if (onChange) onChange(e);
  };

  return (
    <Typography
      component={component}
      ref={elementRef}
      contentEditable={isStudioMode}
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      sx={sx}
      {...props}
    />
  );
});

export default EditableText;
