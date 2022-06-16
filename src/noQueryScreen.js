const RP_MATERIALS_REPO_PATH = "realpython/materials";
const RP_HOME = "https://www.realpython.com";

export function noQueryScreen(type) {
  // document.getElementById("download").remove();

  Array.from(document.querySelectorAll(".error-hide")).forEach((node) => {
    node.remove();
  });

  const sourceCodeButton = document.getElementById("src-code");
  sourceCodeButton.addEventListener("click", () => {
    location.href = `https://www.github.com/${RP_MATERIALS_REPO_PATH}`;
  });
  // sourceCodeButton.innerText = "Browse the Source Code";

  const newNote = document.createElement("p");
  if (type == "API_RATE_LIMIT") {
    newNote.innerText = `GitHub download quota exceeded...`;
  } else if (type == "404") {
    newNote.innerText = "Resource not found...";
  } else {
    newNote.innerText = `Something went wrong...`;
  }

  newNote.classList.add("note");

  document.querySelector("#logo").insertAdjacentElement("afterend", newNote);

  document.getElementById("back-to-rp").addEventListener("click", () => {
    location.href = RP_HOME;
  });
}
