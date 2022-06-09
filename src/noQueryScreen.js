export function noQueryScreen() {
  // document.getElementById("download").remove();

  Array.from(document.querySelectorAll(".no-folder-hide")).forEach((node) => {
    node.remove();
  });

  const sourceCodeButton = document.getElementById("src-code");
  sourceCodeButton.addEventListener("click", () => {
    location.href = GITHUB_ROOT;
  });
  sourceCodeButton.innerText = "Browse the Materials Repository";

  const newNote = document.createElement("p");
  newNote.innerText = `Oops! If you are seeing this it means that you \
    either reached this page from somewhere you werent \
    meant to, or you've used up your download quota for the day.
    
    Don't worry, you can still download the files from the repository directly \
    click below.`;
  newNote.classList.add("note");

  document
    .querySelector(".main-container")
    .insertBefore(newNote, sourceCodeButton);

  document.getElementById("back-to-rp").addEventListener("click", () => {
    location.href = RP_HOME;
  });
}
