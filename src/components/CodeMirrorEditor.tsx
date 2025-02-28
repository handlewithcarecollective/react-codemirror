import React, { type ReactNode, useContext } from "react";
import { EditorContext } from "../contexts/EditorContext.js";
import { createPortal } from "react-dom";

function InnerCodeMirrorEditor() {
  const { setParent } = useContext(EditorContext);

  return <div ref={setParent} />;
}

interface SlotProps {
  children: ReactNode;
}

function CodeMirrorEditorBefore({ children }: SlotProps) {
  const { beforeSlot } = useContext(EditorContext);
  if (!beforeSlot) return null;

  return createPortal(children, beforeSlot);
}

function CodeMirrorEditorAfter({ children }: SlotProps) {
  const { afterSlot } = useContext(EditorContext);
  if (!afterSlot) return null;

  return createPortal(children, afterSlot);
}

export const CodeMirrorEditor = Object.assign(InnerCodeMirrorEditor, {
  Before: CodeMirrorEditorBefore,
  After: CodeMirrorEditorAfter,
});
