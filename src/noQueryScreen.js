import { ERROR_TYPE } from "./error.js";

const RP_MATERIALS_REPO_PATH = "realpython/materials";

export function hideClass(selector) {
  Array.from(document.querySelectorAll(selector)).forEach((node) => {
    node.style.display = "none";
  });
}

export function revealClass(selector) {
  Array.from(document.querySelectorAll(selector)).forEach((node) => {
    node.style.display = "";
  });
}

export function softHideClass(selector) {
  Array.from(document.querySelectorAll(selector)).forEach((node) => {
    node.style.opacity = "0.5";
  });
}

export function softRevealClass(selector) {
  Array.from(document.querySelectorAll(selector)).forEach((node) => {
    node.style.opacity = "1";
  });
}

export function noQueryScreen(type) {
  hideClass(".error-hide");

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

  document
    .querySelector(".title-container")
    .insertAdjacentElement("afterend", newNote);
}
