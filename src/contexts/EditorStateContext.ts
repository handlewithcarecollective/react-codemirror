import { type EditorState } from "@codemirror/state";
import { createContext } from "react";

export const EditorStateContext = createContext<EditorState>(
  null as unknown as EditorState,
);
