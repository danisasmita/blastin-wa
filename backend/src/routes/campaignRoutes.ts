import express from "express";
import isAuth from "../middleware/isAuth";
import * as CampaignController from "../controllers/CampaignController";
import * as CampaignTemplateController from "../controllers/CampaignTemplateController";

const campaignRoutes = express.Router();

campaignRoutes.get("/campaigns", isAuth, CampaignController.index);
campaignRoutes.post("/campaigns", isAuth, CampaignController.store);
campaignRoutes.get("/campaigns/:campaignId", isAuth, CampaignController.show);
campaignRoutes.put("/campaigns/:campaignId", isAuth, CampaignController.update);
campaignRoutes.delete(
  "/campaigns/:campaignId",
  isAuth,
  CampaignController.remove
);
campaignRoutes.post(
  "/campaigns/:campaignId/sync-recipients",
  isAuth,
  CampaignController.syncRecipients
);
campaignRoutes.post(
  "/campaigns/:campaignId/dispatch",
  isAuth,
  CampaignController.dispatch
);
campaignRoutes.post(
  "/campaigns/:campaignId/pause",
  isAuth,
  CampaignController.pause
);

campaignRoutes.get(
  "/campaignTemplates",
  isAuth,
  CampaignTemplateController.index
);
campaignRoutes.post(
  "/campaignTemplates",
  isAuth,
  CampaignTemplateController.store
);
campaignRoutes.get(
  "/campaignTemplates/:templateId",
  isAuth,
  CampaignTemplateController.show
);
campaignRoutes.put(
  "/campaignTemplates/:templateId",
  isAuth,
  CampaignTemplateController.update
);
campaignRoutes.delete(
  "/campaignTemplates/:templateId",
  isAuth,
  CampaignTemplateController.remove
);

export default campaignRoutes;
