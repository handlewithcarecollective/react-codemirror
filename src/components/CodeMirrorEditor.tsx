import React, { useContext } from "react";
import { EditorContext } from "../contexts/EditorContext.js";

export function CodeMirrorEditor() {
  const { setParent } = useContext(EditorContext);

  return <div ref={setParent} />;
}
