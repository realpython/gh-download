export function hydrateDownloadButton(downloadCallback) {
  document
    .getElementById("download")
    .addEventListener("click", downloadCallback);
}

export function hydrateSourceCodeButton(sourceCodeLink) {
  const link = document.getElementById("src-code");

  link.href = new URL(sourceCodeLink);
}
