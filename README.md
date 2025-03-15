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
- [API](#api)
  - [`CodeMirror`](#codemirror)
  - [`CodeMirrorEditor`](#codemirroreditor)
  - [`useEditorState`](#useeditorstate)
  - [`useCompartment`](#usecompartment)
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

To get started, render the `CodeMirror` and `CodeMirrorEditor` components:

```tsx
import { EditorState, type Transaction } from "@codemirror/state";
import { CodeMirror, CodeMirrorEditor } from "@handlewithcare/react-codemirror";
import { basicSetup } from "codemirror";
import React, { StrictMode, useCallback, useState } from "react";

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
      <CodeMirrorEditor />
    </CodeMirror>
  );
}
```

The `CodeMirrorEditor` is where the actual CodeMirror editor will be
instantiated. It can be nested anywhere as a descendant of the `CodeMirror`
component.

The `useCompartment` hook can be used to configure dynamic CodeMirror
extensions. Here’s an example, using a simple language picker:

```tsx
// LanguagePicker.tsx
import { htmlLanguage, html } from "@codemirror/lang-html";
import { language, type Language } from "@codemirror/language";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";

interface Props {
  value: Language;
  onChange: (lang: Language) => void;
}

function LanguagePicker({ value, onChange }: Props) {
  return (
    <Select value={language} onChange={onChange}>
      <Option value={htmlLanguage}>HTML</Option>
      <Option value={javascriptLanguage}>JavaScript</Option>
    </Select>
  );
}

// CodeEditor.tsx
import { javascript } from "@codemirror/lang-javascript";
import { language } from "@codemirror/language";
import { EditorState, type Transaction } from "@codemirror/state";
import { CodeMirror, CodeMirrorEditor } from "@handlewithcare/react-codemirror";
import { basicSetup } from "codemirror";
import React, { StrictMode, useCallback, useState } from "react";

import { LanguagePicker } from "./LanguagePicker.tsx";

function CodeEditor() {
  const [languageExt, reconfigureLanguage] = useCompartment(javascript());

  const extensions = [basicSetup, languageExt];

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
      <LanguagePicker
        value={state.facet(language)}
        onChange={(lang) => reconfigureLanguage(lang)}
      />
      <CodeMirrorEditor />
    </CodeMirror>
  );
}
```

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

### `useEditorState`

```ts
function useEditorState(): EditorState;
```

Provides access to the current EditorState value.

### `useCompartment`

```ts
function useCompartment(
  initialExtension: Extension,
): readonly [Extension, (extension: Extension) => void];
```

Returns a compartment of the provided extension, and a method to reconfigure it.

Example usage:

```tsx
import { javascript } from "@codemirror/lang-javascript";
import { language } from "@codemirror/language";
import { EditorState, type Transaction } from "@codemirror/state";
import { CodeMirror, CodeMirrorEditor } from "@handlewithcare/react-codemirror";
import { basicSetup } from "codemirror";
import React, { StrictMode, useCallback, useState } from "react";

import { LanguagePicker } from "./LanguagePicker.tsx";

function CodeEditor() {
  const [languageExt, reconfigureLanguage] = useCompartment(javascript());

  const extensions = [basicSetup, languageExt];

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
      <LanguagePicker
        value={state.facet(language)}
        onChange={(lang) => reconfigureLanguage(lang)}
      />
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
