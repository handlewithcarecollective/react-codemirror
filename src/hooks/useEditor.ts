import {
  EditorState,
  type Extension,
  type Transaction,
} from "@codemirror/state";
import {
  EditorView,
  ViewPlugin,
  type EditorViewConfig,
} from "@codemirror/view";
import { useState, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";

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
        "A component contains a ProseMirror editor with both value and defaultValue props. " +
          "ProseMirror editors must be either controlled or uncontrolled " +
          "(specify either the state prop, or the defaultState prop, but not both). " +
          "Decide between using a controlled or uncontrolled ProseMirror editor " +
          "and remove one of these props. More info: " +
          "https://reactjs.org/link/controlled-components",
      );
      didWarnValueDefaultValue = true;
    }
  }

  const flushSyncRef = useRef(true);

  const defaultState = options.defaultState ?? EMPTY_STATE;
  const [_state, setState] = useState<EditorState>(defaultState);
  const state = options.state ?? _state;

  const dispatchTransactions = useCallback(
    function dispatchTransactions(
      trs: readonly Transaction[],
      view: EditorView,
    ) {
      const newState = trs[trs.length - 1]?.state;
      if (!newState) return;

      if (flushSyncRef.current) {
        flushSync(() => {
          if (!options.state) {
            setState(newState);
          }

          if (options.dispatchTransactions) {
            options.dispatchTransactions(trs, view);
          }
        });
      } else {
        if (!options.state) {
          setState(newState);
        }

        if (options.dispatchTransactions) {
          options.dispatchTransactions(trs, view);
        }
      }
    },
    [options],
  );

  const config = {
    ...options,
    state,
    dispatchTransactions,
  };

  const [beforeSlot, setBeforeSlot] = useState<HTMLDivElement | null>(null);
  const [afterSlot, setAfterSlot] = useState<HTMLDivElement | null>(null);

  const slotPlugin = useMemo(
    () =>
      ViewPlugin.define((view: EditorView) => {
        const before = document.createElement("div");
        before.style.display = "contents";
        view.dom.prepend(before);
        setBeforeSlot(before);

        const after = document.createElement("div");
        after.style.display = "contents";
        view.dom.append(after);
        setAfterSlot(after);
        return {
          destroy: () => {
            setBeforeSlot((prev) => (prev === before ? null : prev));
            setAfterSlot((prev) => (prev === after ? null : prev));
          },
        };
      }),
    [],
  );

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
        extensions: [
          ...((config.extensions as readonly Extension[] | undefined) ?? []),
          slotPlugin,
        ],
      });
      setView(newView);
      return;
    }

    if (view.state !== config.state) {
      view.setState(config.state);
    }
  });

  console.log(state);

  return { view, state, beforeSlot, afterSlot, flushSyncRef };
}
