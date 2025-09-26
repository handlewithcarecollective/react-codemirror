import React, { type HTMLProps, useContext } from "react";

import { EditorContext } from "../contexts/EditorContext.js";

export function CodeMirrorEditor(props: HTMLProps<HTMLDivElement>) {
  const { setParent } = useContext(EditorContext);

  return <div ref={setParent} {...props} />;
}
