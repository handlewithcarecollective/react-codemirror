import { type EditorView } from "@codemirror/view";
import { createContext } from "react";

export interface EditorContextValue {
  view: EditorView | null;
  setParent: (el: HTMLDivElement | null) => void;
}

export const EditorContext = createContext<EditorContextValue>(
  null as unknown as EditorContextValue,
);
