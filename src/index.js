import { downloadMaterials } from "./downloadRpMaterials.js";
import { initializeButtons } from "./initializeButtons.js";
import { noQueryScreen } from "./noQueryScreen.js";

window.onload = async () => {
  const targetFolder = getUrlFolderName();
  if (targetFolder) {
    try {
      await downloadMaterials(targetFolder);
      initializeButtons(targetFolder);
    } catch (e) {
      console.error(e);
      noQueryScreen();
    }
  } else {
    noQueryScreen();
  }
};
