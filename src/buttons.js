export function hydrateDownloadButton(downloadCallback) {
  document
    .getElementById("download")
    .addEventListener("click", downloadCallback);
}

export function hydrateSourceCodeButton(sourceCodeLink, force = false) {
  const button = document.getElementById("src-code");

  if (button.href == window.location || force == true) {
    button.href = sourceCodeLink;
  }
}
