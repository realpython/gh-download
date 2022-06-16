import { MaterialsQuery } from "./query.js";

import { initializeButtons } from "./initializeButtons.js";
import { noQueryScreen } from "./noQueryScreen.js";
import { ERROR_TYPE } from "./error.js";

window.onload = async () => {
  try {
    const materialsQuery = new MaterialsQuery();
    const [downloadCallback, sourceCodeLink] = await materialsQuery.download();
    initializeButtons(downloadCallback, sourceCodeLink);
  } catch (e) {
    if (e.message == ERROR_TYPE.API_LIMIT) {
      noQueryScreen(ERROR_TYPE.API_LIMIT);
    } else if (e.message == ERROR_TYPE.NOT_FOUND) {
      noQueryScreen(ERROR_TYPE.NOT_FOUND);
    } else {
      console.log(e);
      noQueryScreen();
    }
  }
};
