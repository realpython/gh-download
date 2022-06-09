import { downloadMaterials } from "./downloadRpMaterials.js";

const GITHUB_ROOT = "https://github.com/realpython/materials/tree/master/";
const RP_HOME = "https://realpython.com/";

export function initializeButtons(targetFolder) {
  document
    .getElementById("download")
    .addEventListener("click", () => downloadMaterials(targetFolder));

  document.getElementById("src-code").addEventListener("click", () => {
    location.href = GITHUB_ROOT + targetFolder;
  });

  document.getElementById("back-to-rp").addEventListener("click", () => {
    location.href = RP_HOME;
  });
}
