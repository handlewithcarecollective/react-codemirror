import { type Compartment, type Extension } from "@codemirror/state";
import { useRef } from "react";

import { useEditorEventCallback } from "./useEditorEventCallback.js";

/**
 * Returns a compartment of the provided extension, and a method
 * to reconfigure it.
 *
 * @example
 *
 * ```
 * function ThemePicker() {
 *   const state = useEditorState();
 *   const theme = themeCompartment.get(state);
 *   const dark = theme === oneDark;
 *   const reconfigureTheme = useReconfigure(themeCompartment);
 *
 *   return (
 *     <button
 *       onClick={() => {
 *         reconfigureTheme(dark ? [] : oneDark);
 *       }}
 *     >
 *       Enable {dark ? "light" : "dark"} mode
 *     </button>
 *   );
 * }
 * ```
 */
export function useReconfigure(compartment: Compartment) {
  const compartmentRef = useRef(compartment);

  const reconfigure = useEditorEventCallback((view, extension: Extension) => {
    view.dispatch({
      effects: compartmentRef.current.reconfigure(extension),
    });
  });

  return reconfigure;
}
