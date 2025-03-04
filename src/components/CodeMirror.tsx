import React, { type ReactNode, useMemo, useState } from "react";

import { EditorContext } from "../contexts/EditorContext.js";
import { EditorStateContext } from "../contexts/EditorStateContext.js";
import { type UseViewOptions, useEditor } from "../hooks/useEditor.js";

import { LayoutGroup } from "./LayoutGroup.js";

type Props = UseViewOptions & {
  children: ReactNode;
};

function CodeMirrorInner({ children, ...config }: Props) {
  const [parent, setParent] = useState<HTMLDivElement | null>(null);

  const { view, state, flushSyncRef } = useEditor(parent, config);

  const editor = useMemo(
    () => ({
      view,
      flushSyncRef,
      setParent,
    }),
    [flushSyncRef, view],
  );

  return (
    <EditorContext.Provider value={editor}>
      <EditorStateContext value={state}>{children}</EditorStateContext>
    </EditorContext.Provider>
  );
}

export function CodeMirror(props: Props) {
  return (
    <LayoutGroup>
      <CodeMirrorInner {...props} />
    </LayoutGroup>
  );
}
