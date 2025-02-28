import type { EditorView } from "@codemirror/view";
import { useCallback, useContext, useRef } from "react";

import { EditorContext } from "../contexts/EditorContext.js";

import { useEditorEffect } from "./useEditorEffect.js";

/**
 * Returns a stable function reference to be used as an
 * event handler callback.
 *
 * The callback will be called with the EditorView instance
 * as its first argument.
 *
 * This hook can only be used in children of the CodeMirror
 * component.
 */
export function useEditorEventCallback<T extends unknown[], R>(
  callback: (view: EditorView, ...args: T) => R,
) {
  const ref = useRef(callback);
  const { view } = useContext(EditorContext);

  useEditorEffect(() => {
    ref.current = callback;
  }, [callback]);

  return useCallback(
    (...args: T) => {
      if (view) {
        return ref.current(view, ...args);
      }
      return;
    },
    [view],
  );
}
