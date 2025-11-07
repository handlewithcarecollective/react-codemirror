# @handlewithcare/react-codemirror

A simple library for safely integrating [React](https://react.dev) and
[CodeMirror](https://codemirror.net).

## Installation

npm:

```sh
npm install @handlewithcare/react-codemirror
```

yarn:

```sh
yarn add @handlewithcare/react-codemirror
```

<!-- toc -->

- [Overview](#overview)
- [Usage](#usage)
  - [Dynamic extensions](#dynamic-extensions)
    - [`useReconfigure`](#usereconfigure)
    - [`useSyncExtensions`](#usesyncextensions)
  - [Other hooks](#other-hooks)
- [API](#api)
  - [`CodeMirror`](#codemirror)
  - [`CodeMirrorEditor`](#codemirroreditor)
  - [`react`](#react)
  - [`useEditorState`](#useeditorstate)
  - [`useReconfigure`](#usereconfigure-1)
  - [`useSyncExtensions`](#usesyncextensions-1)
  - [`useEditorEventCallback`](#useeditoreventcallback)
  - [`useEditorEffect`](#useeditoreffect)
- [Looking for someone to collaborate with?](#looking-for-someone-to-collaborate-with)

<!-- tocstop -->

## Overview

This library provides an API similar to that of
[`@handlewithcare/react-prosemirror`](https://github.com/handlewithcarecollective/react-prosemirror)
for integrating React with CodeMirror. The surface area is considerably smaller,
because CodeMirror has no notion of NodeViews. A future version of this library
may support React-based widgets and tooltips.

## Usage

To get started, render the `CodeMirror` and `CodeMirrorEditor` components, and
add the `react` extension to your EditorState:

```tsx
import { EditorState, type Transaction } from "@codemirror/state";
import { CodeMirror, CodeMirrorEditor, react } from "@handlewithcare/react-codemirror";
import { basicSetup } from "codemirror";
import React, { StrictMode, useCallback, useState } from "react";

// NOTE: You must also add the `react` extension to your EditorState!
const editorState = EditorState.create({ doc: "", [basicSetup, react] });

function CodeEditor() {
  const [state, setState] = useState(editorState);

  const dispatchTransactions = useCallback((trs: readonly Transaction[]) => {
    setState(trs[trs.length - 1]!.state);
  }, []);

  return (
    <CodeMirror
      state={state}
      dispatchTransactions={dispatchTransactions}
      extensions={basicSetup}
    >
      <CodeMirrorEditor />
    </CodeMirror>
  );
}
```

The `CodeMirrorEditor` is where the actual CodeMirror editor will be
instantiated. It can be nested anywhere as a descendant of the `CodeMirror`
component.

The `react` extension is necessary for ensuring that the React state stays in
sync with the CodeMirror EditorState.

### Dynamic extensions

#### `useReconfigure`

The `useReconfigure` hook can be used to configure dynamic CodeMirror
extensions. The function returned by `useReconfigure` should only be used in an
event callback. If you need to keep a compartment in sync with some external
state, see [`useSyncExtensions`](#usesyncexetensions). Here’s an example with
`useReconfigure`, using a simple theme switcher:

```tsx
// ThemePicker.tsx
import { oneDark } from "@codemirror/theme-one-dark";
import {
  useEditorState,
  useReconfigure,
} from "@handlewithcare/react-codemirror";

export const themeCompartment = new Compartment();

export function ThemePicker() {
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

// CodeEditor.tsx
import { javascript } from "@codemirror/lang-javascript";
import { language } from "@codemirror/language";
import { EditorState, type Transaction } from "@codemirror/state";
import {
  CodeMirror,
  CodeMirrorEditor,
  useReconfigure,
} from "@handlewithcare/react-codemirror";
import { basicSetup } from "codemirror";
import React, { StrictMode, useCallback, useState } from "react";

import { ThemePicker, themeCompartment } from "./ThemePicker.tsx";

const extensions = [basicSetup, themeCompartment.of([])];

function CodeEditor() {
  const [state, setState] = useState(() =>
    EditorState.create({ doc: "", extensions }),
  );

  const dispatchTransactions = useCallback((trs: readonly Transaction[]) => {
    setState(trs[trs.length - 1]!.state);
  }, []);

  return (
    <CodeMirror
      state={state}
      dispatchTransactions={dispatchTransactions}
      extensions={extensions}
    >
      <ThemePicker />
      <CodeMirrorEditor />
    </CodeMirror>
  );
}
```

#### `useSyncExtensions`

The `useSyncExtensions` hook can be used keep the CodeMirror EditorState's
extensions in sync with external state. In general, this should be avoided —
it's better to either derive state _from_ your CodeMirror EditorState or lift
the EditorState into your global/top-level state and update it at the same time
as you update other state (like the user's theme). However, sometimes you need
to have a local EditorState that is derived from state that lives higher up in
the tree.

The `useSyncExtensions` hook _must_ be used in the component that owns the
EditorState, otherwise React will throw an error about updating state from
another component.

```tsx
function ThemePicker() {
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => {
        dispatch(setTheme(theme === "light" ? "dark" : "light"));
      }}
    >
      Enable {theme === "dark" ? "light" : "dark"} mode
    </button>
  );
}

function Editor() {
  const [state, setState] = useState(editorState);

  const theme = useSelector((state) => state.theme);
  const themeExtension = theme === "light" ? [] : oneDark;
  useSyncExtensions([themeCompartment], [themeExtension], state, setState);

  const dispatchTransactions = useCallback((trs: readonly Transaction[]) => {
    setState(trs[trs.length - 1].state);
  }, []);

  return (
    <CodeMirror
      state={state}
      dispatchTransactions={dispatchTransactions}
      extensions={extensions}
    >
      <CodeMirrorEditor />
    </CodeMirror>
  );
}
```

### Other hooks

The `useEditorEventCallback` hook is a more general purpose hook that allows
components that are descendants of the `CodeMirror` component to dispatch a
transaction or otherwise interact with the CodeMirror EditorView in an event
callback:

```tsx
// AutocompleteButton.tsx
import { useEditorEventCallback } from "@handlewithcare/react-codemirror";

export function AutocompleteButton() {
  const onClick = useEditorEventCallback(async (view) => {
    const result = await fetchMagicAutoComplete(view.state.doc.toString());
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.size,
        insert: result,
      },
    });
  });

  return <button onClick={onClick}>Autocomplete</button>;
}

// CodeEditor.tsx
import { EditorState, type Transaction } from "@codemirror/state";
import { CodeMirror, CodeMirrorEditor } from "@handlewithcare/react-codemirror";
import { basicSetup } from "codemirror";
import React, { StrictMode, useCallback, useState } from "react";

import { AutocompleteButton } from "./AutocompleteButton.tsx";

const editorState = EditorState.create({ doc: "", basicSetup });

function CodeEditor() {
  const [state, setState] = useState(editorState);

  const dispatchTransactions = useCallback((trs: readonly Transaction[]) => {
    setState(trs[trs.length - 1]!.state);
  }, []);

  return (
    <CodeMirror
      state={state}
      dispatchTransactions={dispatchTransactions}
      extensions={basicSetup}
    >
      <AutocompleteButton />
      <CodeMirrorEditor />
    </CodeMirror>
  );
}
```

## API

### `CodeMirror`

```ts
function CodeMirror(
  props: Omit<EditorViewConfig, "parent"> & {
    defaultState?: EditorState;
    children: ReactNode;
  },
): JSX.Element;
```

Provides the CodeMirror context.

Example usage:

```tsx
import { EditorState, type Transaction } from "@codemirror/state";
import { CodeMirror, CodeMirrorEditor } from "@handlewithcare/react-codemirror";
import { basicSetup } from "codemirror";

const editorState = EditorState.create({ doc: "", basicSetup });

function CodeEditor() {
  return (
    <CodeMirror
      defaultState={editorState}
      dispatchTransactions={dispatchTransactions}
    >
      <CodeMirrorEditor />
    </CodeMirror>
  );
}
```

### `CodeMirrorEditor`

```ts
function CodeMirrorEditor(): JSX.Element;
```

Renders the actual editable CodeMirror editor.

This **must** be a descendant of the `CodeMirror` component. It may be wrapped
in other components, and other children may be passed before or after.

Example usage:

```tsx
import { EditorState, type Transaction } from "@codemirror/state";
import { CodeMirror, CodeMirrorEditor } from "@handlewithcare/react-codemirror";
import { basicSetup } from "codemirror";

const editorState = EditorState.create({ doc: "", basicSetup });

function CodeEditor() {
  return (
    <CodeMirror
      defaultState={editorState}
      dispatchTransactions={dispatchTransactions}
    >
      <ToolBar />
      <SomeWrapper>
        <CodeMirrorEditor />
      </SomeWrapper>
      <Footnotes />
    </CodeMirror>
  );
}
```

### `react`

```ts
type Extension;
```

A CodeMirror extension that allows react-codemirror to keep React state in sync
with CodeMirror state.

### `useEditorState`

```ts
function useEditorState(): EditorState;
```

Provides access to the current EditorState value.

### `useReconfigure`

```ts
function useReconfigure(
  compartment: Compartment,
): (extension: Extension) => void;
```

Returns a reconfigure function that will reconfigure the provided Compartment.

Example usage:

```tsx
import { oneDark } from "@codemirror/theme-one-dark";
import {
  useEditorState,
  useReconfigure,
} from "@handlewithcare/react-codemirror";

export const themeCompartment = new Compartment();

export function ThemePicker() {
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
```

### `useSyncExtensions`

```ts
function useSyncExtensions(
  compartments: Compartment[],
  extensions: Extension[],
  editorState: EditorState,
  setEditorState: (editorState: EditorState) => void,
): void;
```

Keep compartmentalized extensions in sync with external state.

If the state that determines the value of a compartment necessarily lives
outside the CodeMirror EditorState (say, an app-wide theme picker), this hook
can be used to keep it in sync with the EditorState.

To avoid state tearing, this hook calls the `setEditorState` argument in the
render phase. This means that it _must_ be used in the component that owns the
EditorState. If your EditorState lives in a global state manager, you should not
use this hook.

Example usage:

```tsx
function Editor() {
  const [state, setState] = useState(editorState);

  const theme = useSelector((state) => state.theme);
  const themeExtension = theme === "light" ? [] : oneDark;
  useSyncExtensions([themeCompartment], [themeExtension], state, setState);

  const dispatchTransactions = useCallback((trs: readonly Transaction[]) => {
    setState(trs[trs.length - 1].state);
  }, []);

  return (
    <CodeMirror
      state={state}
      dispatchTransactions={dispatchTransactions}
      extensions={extensions}
    >
      <CodeMirrorEditor />
    </CodeMirror>
  );
}
```

### `useEditorEventCallback`

```ts
function useEditorEventcallback<T extends unknown[]>(
  callback: (view: EditorView, ...args: T) => void,
): void;
```

Returns a stable function reference to be used as an event handler callback.

The callback will be called with the EditorView instance as its first argument.

### `useEditorEffect`

```ts
function useEditorEffect(
  effect: (view: EditorView) => void | (() => void),
  dependencies?: React.DependencyList,
): void;
```

Registers a layout effect to run after the EditorView has been updated with the
latest EditorState.

Effects can take an EditorView instance as an argument. This hook should be used
to execute layout effects that depend on the EditorView, such as for positioning
DOM nodes based on CodeMirror positions.

Layout effects registered with this hook still fire synchronously after all DOM
mutations, but they do so _after_ the EditorView has been updated, even when the
EditorView lives in an ancestor component.

## Looking for someone to collaborate with?

Reach out to [Handle with Care](https://handlewithcare.dev/#get-in-touch)! We're
a product development collective with years of experience bringing excellent
ideas to life. We love React and ProseMirror, and we're always looking for new
folks to work with!
