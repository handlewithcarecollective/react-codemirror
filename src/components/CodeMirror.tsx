import { EditorContext } from "../contexts/EditorContext.js";
import { EditorStateContext } from "../contexts/EditorStateContext.js";
import React, { type ReactNode, useMemo, useState } from "react";
import { LayoutGroup } from "./LayoutGroup.js";
import { useView, type UseViewOptions } from "../hooks/useView.js";

type Props = UseViewOptions & {
  children: ReactNode;
};

function CodeMirrorInner({ children, ...config }: Props) {
  const [parent, setParent] = useState<HTMLDivElement | null>(null);

  const { view, state, flushSyncRef } = useView(parent, config);

  const editor = useMemo(
    () => ({
      view,
      flushSyncRef,
      setParent,
      parent,
    }),
    [flushSyncRef, parent, view],
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
