import { FALLBACK_URL } from "./query.js";

export function hydrateDownloadButton(downloadCallback) {
  document
    .getElementById("download")
    .addEventListener("click", downloadCallback);
}

export function hydrateSourceCodeButton(sourceCodeLink, force = false) {
  const link = document.getElementById("src-code");

  link.href = new URL(sourceCodeLink);
}
