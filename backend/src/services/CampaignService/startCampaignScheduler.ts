import { logger } from "../../utils/logger";
import { runDueCampaigns } from "./helpers";

let schedulerStarted = false;

export const startCampaignScheduler = (): void => {
  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;

  setInterval(async () => {
    try {
      await runDueCampaigns();
    } catch (error) {
      logger.error({ info: "Campaign scheduler failed", error });
    }
  }, 60 * 1000);
};
