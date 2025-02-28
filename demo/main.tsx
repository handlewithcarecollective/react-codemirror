import { EditorState, type Transaction } from "@codemirror/state";
import React, { useCallback, useState } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

import { CodeMirror, CodeMirrorEditor } from "../src/index.js";

const extensions = [
  basicSetup,
  javascript({ jsx: true, typescript: true }),
  oneDark,
];

const editorState = EditorState.create({ doc: `const a = "a"`, extensions });

function DemoEditor() {
  const [state, setState] = useState(editorState);

  const dispatchTransactions = useCallback((trs: readonly Transaction[]) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setState(trs[trs.length - 1]!.state);
  }, []);

  return (
    <main>
      <h1>React CodeMirror demo</h1>
      <CodeMirror
        state={state}
        dispatchTransactions={dispatchTransactions}
        extensions={extensions}
      >
        <CodeMirrorEditor.Before>Before!</CodeMirrorEditor.Before>
        <CodeMirrorEditor />
      </CodeMirror>
    </main>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <DemoEditor />
  </StrictMode>,
);
