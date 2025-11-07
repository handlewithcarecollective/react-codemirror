import {
  type Compartment,
  type EditorState,
  type Extension,
  type StateEffect,
} from "@codemirror/state";

function isExtensionArray(extension: Extension): extension is Extension[] {
  return Array.isArray(extension);
}

function extensionIsEqual(a: Extension, b: Extension) {
  if (isExtensionArray(a)) {
    if (!isExtensionArray(b)) return false;

    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const childA = a[i]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const childB = b[i]!;

      if (!extensionIsEqual(childA, childB)) return false;
    }

    return true;
  }

  return a === b;
}

/**
 * Keep compartmentalized extensions in sync with external state.
 *
 * If the state that determines the value of a compartment necessarily
 * lives outside the CodeMirror EditorState (say, an app-wide theme
 * picker), this hook can be used to keep it in sync with the EditorState.
 *
 * To avoid state tearing, this hook calls the `setEditorState` argument
 * in the render phase. This means that it _must_ be used in the
 * component that owns the EditorState. If your EditorState lives in a
 * global state manager, you should not use this hook.
 *
 * @example
 *
 * ```
 * function ThemePicker() {
 *   const theme = useSelector((state) => state.theme)
 *   const dispatch = useDispatch()
 *
 *   return (
 *     <button
 *       onClick={() => {
 *         dispatch(setTheme(theme === "light" ? "dark" : "light"));
 *       }}
 *     >
 *       Enable {theme === "dark" ? "light" : "dark"} mode
 *     </button>
 *   );
 * }
 *
 * function Editor() {
 *   const [state, setState] = useState(editorState);
 *
 *   const theme = useSelector((state) => state.theme)
 *   const themeExtension = theme === "light" ? [] : oneDark
 *   useSyncExtensions([themeCompartment], [themeExtension], state, setState);
 *
 *   const dispatchTransactions = useCallback((trs: readonly Transaction[]) => {
 *     setState(trs[trs.length - 1].state);
 *   }, []);
 *
 *   return (
 *     <CodeMirror
 *       state={state}
 *       dispatchTransactions={dispatchTransactions}
 *       extensions={extensions}
 *     >
 *       <CodeMirrorEditor />
 *     </CodeMirror>
 *   );
 * }
 * ```
 *
 *
 */
export function useSyncExtensions(
  compartments: Compartment[],
  extensions: Extension[],
  editorState: EditorState,
  setEditorState: (editorState: EditorState) => void,
) {
  if (compartments.length !== extensions.length) {
    throw new Error(
      `Compartments and extensions must have the same length. There should be one extension for each compartment.`,
    );
  }

  const effects: StateEffect<unknown>[] = [];

  for (let i = 0; i < compartments.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const compartment = compartments[i]!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const extension = extensions[i]!;

    const prevExtension = compartment.get(editorState);
    if (!prevExtension || !extensionIsEqual(extension, prevExtension)) {
      effects.push(compartment.reconfigure(extension));
    }
  }

  if (effects.length) {
    setEditorState(editorState.update({ effects }).state);
  }
}
