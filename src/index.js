import { MaterialsQuery } from "./query.js";

import { initializeButtons } from "./initializeButtons.js";
import { noQueryScreen } from "./noQueryScreen.js";

window.onload = () => {
  try {
    const materialsQuery = new MaterialsQuery();
    const [downloadCallback, sourceCodeLink] = materialsQuery.download();
    initializeButtons(downloadCallback, sourceCodeLink);
  } catch (e) {
    console.log(e);
    noQueryScreen();
  }
};
