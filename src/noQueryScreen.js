import { RP_HOME, RP_MATERIALS_REPO_PATH } from "./query.js";

export function noQueryScreen() {
  // document.getElementById("download").remove();

  Array.from(document.querySelectorAll(".no-folder-hide")).forEach((node) => {
    node.remove();
  });

  const sourceCodeButton = document.getElementById("src-code");
  sourceCodeButton.addEventListener("click", () => {
    location.href = `https://www.github.com/${RP_MATERIALS_REPO_PATH}`;
  });
  // sourceCodeButton.innerText = "Browse the Source Code";

  const newNote = document.createElement("p");
  newNote.innerText = `Something went wrong...`;
  newNote.classList.add("note");

  document
    // .querySelector(".main-container")
    .querySelector("#logo")
    // .insertAdjacentElement(newNote, sourceCodeButton);
    .insertAdjacentElement("afterend", newNote);

  document.getElementById("back-to-rp").addEventListener("click", () => {
    location.href = RP_HOME;
  });
}
