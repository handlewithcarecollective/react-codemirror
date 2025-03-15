import { Compartment, type Extension } from "@codemirror/state";
import { useRef } from "react";

import { useEditorEventCallback } from "./useEditorEventCallback.js";

/**
 * Returns a compartment of the provided extension, and a method
 * to reconfigure it.
 *
 * @example
 *
 * ```
 * const [languageConf, reconfigureLanguage] = useCompartment(javascript())
 * const extensions = [basicSetup, languageConf]
 *
 * return (
 *   <CodeMirror
 *     state={state}
 *     dispatchTransactions={dispatchTransactions}
 *     extensions={extensions}
 *   >
 *     <LanguagePicker
 *       value={state.facet(language)}
 *       onChange={(lang) => reconfigureLanguage(lang)}
 *     />
 *     <CodeMirrorEditor />
 *   </CodeMirror>
 * )
 * ```
 */
export function useCompartment(initialExtension: Extension) {
  const compartmentRef = useRef(new Compartment());
  const extensionRef = useRef(compartmentRef.current.of(initialExtension));

  const reconfigure = useEditorEventCallback((view, extension: Extension) => {
    view.dispatch({
      effects: compartmentRef.current.reconfigure(extension),
    });
  });

  return [extensionRef.current, reconfigure] as const;
}
