import { ERROR_TYPE } from "./error.js";

const MESSAGES = {
  [ERROR_TYPE.API_LIMIT]:
    "GitHub rate limit exceeded. Please try again in a few minutes or browse the source code via the button below.",
  [ERROR_TYPE.NOT_FOUND]:
    "We couldn't find these files on GitHub. You can browse the source code via the button below.",
  [ERROR_TYPE.INVALID_URL]:
    "This download link isn't valid. You can browse the source code via the button below.",
};

const DEFAULT_MESSAGE =
  "Something went wrong. Please try again in a few minutes or browse the source code via the button below.";

export function errorScreen(type) {
  document
    .querySelectorAll(".error-hide, .note")
    .forEach((node) => node.remove());

  const newNote = document.createElement("p");
  newNote.innerText = MESSAGES[type] ?? DEFAULT_MESSAGE;
  newNote.classList.add("note");

  document.querySelector("#logo").insertAdjacentElement("afterend", newNote);
}
