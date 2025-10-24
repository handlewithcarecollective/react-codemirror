import { javascript } from "@codemirror/lang-javascript";
import { Compartment, EditorState, type Transaction } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";
import React, { StrictMode, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  CodeMirror,
  CodeMirrorEditor,
  react,
  useEditorState,
  useReconfigure,
} from "../src/index.js";

const themeCompartment = new Compartment();

const extensions = [
  basicSetup,
  javascript({ jsx: true, typescript: true }),
  react,
  themeCompartment.of(oneDark),
];

const editorState = EditorState.create({
  doc: `/**
 * @fileoverview
 * This is the code that runs this demo!
 */

import { javascript } from "@codemirror/lang-javascript";
import { Compartment, EditorState, type Transaction } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";
import React, { StrictMode, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  CodeMirror,
  CodeMirrorEditor,
  react,
  useEditorState,
  useReconfigure,
} from "@handlewithcare/react-codemirror";

const themeCompartment = new Compartment();

const extensions = [
  basicSetup,
  javascript({ jsx: true, typescript: true }),
  react,
  themeCompartment.of(oneDark),
];

const editorState = EditorState.create({ doc: \`const a = "a"\`, extensions });

function ThemePicker() {
  const state = useEditorState();
  const theme = themeCompartment.get(state);
  const dark = theme === oneDark;
  const reconfigureTheme = useReconfigure(themeCompartment);

  return (
    <button
      onClick={() => {
        reconfigureTheme(dark ? [] : oneDark);
      }}
    >
      Enable {dark ? "light" : "dark"} mode
    </button>
  );
}

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
        <ThemePicker />
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
`,
  extensions,
});

function ThemePicker() {
  const state = useEditorState();
  const theme = themeCompartment.get(state);
  const dark = theme === oneDark;
  const reconfigureTheme = useReconfigure(themeCompartment);

  return (
    <button
      onClick={() => {
        reconfigureTheme(dark ? [] : oneDark);
      }}
    >
      Enable {dark ? "light" : "dark"} mode
    </button>
  );
}

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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <ThemePicker />
          <button
            onClick={() => {
              setState(editorState);
            }}
          >
            Reset
          </button>
        </div>
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
