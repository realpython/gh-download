import { RP_HOME } from "./query.js";

export function initializeButtons(downloadCallback, sourceCodeLink) {
  document
    .getElementById("download")
    .addEventListener("click", downloadCallback);

  document.getElementById("src-code").addEventListener("click", () => {
    location.href = sourceCodeLink;
  });

  document.getElementById("back-to-rp").addEventListener("click", () => {
    location.href = RP_HOME;
  });
}
