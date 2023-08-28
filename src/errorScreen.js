import { ERROR_TYPE } from "./error.js";

const RP_MATERIALS_REPO_PATH = "realpython/materials";

export function errorScreen(type) {
  Array.from(document.querySelectorAll(".error-hide")).forEach((node) => {
    node.remove();
  });

  const newNote = document.createElement("p");
  if (type == ERROR_TYPE.API_LIMIT) {
    newNote.innerText = `GitHub rate limit exceeded. Please try again in a few minutes or browse the source code via the button below.`;
  } else if (type == ERROR_TYPE.NOT_FOUND) {
    newNote.innerText = "Resource not found...";
  } else {
    newNote.innerText = `Something went wrong. Please try again in a few minutes or browse the source code via the button below.`;
  }

  newNote.classList.add("note");

  document.querySelector("#logo").insertAdjacentElement("afterend", newNote);
}
