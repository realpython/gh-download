import { ERROR_TYPE } from "./error.js";

const RP_MATERIALS_REPO_PATH = "realpython/materials";

export function noQueryScreen(type) {
  Array.from(document.querySelectorAll(".error-hide")).forEach((node) => {
    node.remove();
  });

  const sourceCodeButton = document.getElementById("src-code");
  sourceCodeButton.addEventListener("click", () => {
    location.href = `https://www.github.com/${RP_MATERIALS_REPO_PATH}`;
  });

  const newNote = document.createElement("p");
  if (type == ERROR_TYPE.API_LIMIT) {
    newNote.innerText = `GitHub download quota exceeded...`;
  } else if (type == ERROR_TYPE.NOT_FOUND) {
    newNote.innerText = "Resource not found...";
  } else {
    newNote.innerText = `Something went wrong...`;
  }

  newNote.classList.add("note");

  document.querySelector("#logo").insertAdjacentElement("afterend", newNote);
}
