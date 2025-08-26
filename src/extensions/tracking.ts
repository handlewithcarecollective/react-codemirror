import { StateField, type Transaction } from "@codemirror/state";

export const tracking = StateField.define<Transaction[]>({
  create() {
    return [];
  },
  update(value, tr) {
    return [...value, tr];
  },
});
