import { type EditorView } from "@codemirror/view";
import { createContext, type MutableRefObject } from "react";

export interface EditorContextValue {
  view: EditorView | null;
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  flushSyncRef: MutableRefObject<boolean>;
  setParent: (el: HTMLDivElement | null) => void;
}

export const EditorContext = createContext<EditorContextValue>(
  null as unknown as EditorContextValue,
);
