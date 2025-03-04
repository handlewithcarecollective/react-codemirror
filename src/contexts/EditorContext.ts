import { type EditorView } from "@codemirror/view";
import { type MutableRefObject, createContext } from "react";

export interface EditorContextValue {
  view: EditorView | null;
  // Using the deprecated MutableRefObject so that types still
  // work for folks using versions of React older than v19
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  flushSyncRef: MutableRefObject<boolean>;
  beforeSlot: HTMLDivElement | null;
  afterSlot: HTMLDivElement | null;
  setParent: (el: HTMLDivElement | null) => void;
}

export const EditorContext = createContext<EditorContextValue>(
  null as unknown as EditorContextValue,
);
