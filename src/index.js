import { MaterialsQuery } from "./query.js";

import { initializeButtons } from "./initializeButtons.js";
import { noQueryScreen } from "./noQueryScreen.js";

window.onload = async () => {
  try {
    const materialsQuery = new MaterialsQuery();
    const [downloadCallback, sourceCodeLink] = await materialsQuery.download();
    initializeButtons(downloadCallback, sourceCodeLink);
  } catch (e) {
    if (e.message.includes("API rate limit")) {
      noQueryScreen("API_RATE_LIMIT");
    } else {
      console.log(e.message);
      noQueryScreen();
    }
  }
};
