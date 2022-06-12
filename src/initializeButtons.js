export function initializeButtons(downloadCallback, sourceCodeLink) {
  document
    .getElementById("download")
    .addEventListener("click", downloadCallback);

  document.getElementById("src-code").href = sourceCodeLink;
}
