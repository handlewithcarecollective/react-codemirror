import { EditorState, type Transaction } from "@codemirror/state";
import { EditorView, type EditorViewConfig } from "@codemirror/view";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { tracking } from "../extensions/tracking.js";

export type UseViewOptions = Omit<EditorViewConfig, "parent"> & {
  defaultState?: EditorState;
};

const EMPTY_STATE = EditorState.create();

let didWarnValueDefaultValue = false;

export function useEditor(
  parent: HTMLDivElement | null,
  options: UseViewOptions,
) {
  if (
    typeof process !== "undefined" &&
    process.env["NODE_ENV"] !== "production"
  ) {
    if (
      options.defaultState !== undefined &&
      options.state !== undefined &&
      !didWarnValueDefaultValue
    ) {
      console.error(
        "A component contains a CodeMirror editor with both value and defaultValue props. " +
          "CodeMirror editors must be either controlled or uncontrolled " +
          "(specify either the state prop, or the defaultState prop, but not both). " +
          "Decide between using a controlled or uncontrolled CodeMirror editor " +
          "and remove one of these props. More info: " +
          "https://reactjs.org/link/controlled-components",
      );
      didWarnValueDefaultValue = true;
    }
  }

  const defaultState = options.defaultState ?? EMPTY_STATE;
  const [_state, setState] = useState<EditorState>(defaultState);
  const state = options.state ?? _state;

  const seen = useRef<Set<Transaction>>(new Set(state.field(tracking)));

  const dispatchTransactions = useCallback(
    function dispatchTransactions(
      trs: readonly Transaction[],
      view: EditorView,
    ) {
      if (!options.state) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setState(trs[trs.length - 1]!.state);
      }

      if (options.dispatchTransactions) {
        options.dispatchTransactions(trs, view);
      }
    },
    [options],
  );

  const config = {
    ...options,
    state,
    dispatchTransactions,
  };

  const [view, setView] = useState<EditorView | null>(null);

  useLayoutEffect(() => {
    return () => {
      view?.destroy();
    };
  }, [view]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (!parent) {
      setView(null);
      return;
    }
    if (!view || view.dom.parentElement !== parent) {
      const newView = new EditorView({
        parent,
        ...config,
      });
      setView(newView);
      return;
    }

    const trs = state.field(tracking);
    const newTrs = trs.filter((tr) => !seen.current.has(tr));

    if (newTrs.length) {
      view.update(newTrs);
      newTrs.forEach((tr) => seen.current.add(tr));
    }
  });

  return { view, state };
}
