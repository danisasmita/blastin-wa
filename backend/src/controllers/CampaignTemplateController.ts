import * as Yup from "yup";
import { Request, Response } from "express";
import CampaignTemplate from "../models/CampaignTemplate";
import AppError from "../errors/AppError";

export const index = async (_req: Request, res: Response): Promise<Response> => {
  const templates = await CampaignTemplate.findAll({
    order: [["name", "ASC"]]
  });

  return res.json(templates);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const template = await CampaignTemplate.findByPk(req.params.templateId);

  if (!template) {
    throw new AppError("ERR_NO_CAMPAIGN_TEMPLATE_FOUND", 404);
  }

  return res.json(template);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    body: Yup.string().required(),
    isActive: Yup.boolean()
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const template = await CampaignTemplate.create(req.body);

  return res.status(201).json(template);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const template = await CampaignTemplate.findByPk(req.params.templateId);

  if (!template) {
    throw new AppError("ERR_NO_CAMPAIGN_TEMPLATE_FOUND", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string(),
    body: Yup.string(),
    isActive: Yup.boolean()
  });

  try {
    await schema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  await template.update(req.body);

  return res.json(template);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const template = await CampaignTemplate.findByPk(req.params.templateId);

  if (!template) {
    throw new AppError("ERR_NO_CAMPAIGN_TEMPLATE_FOUND", 404);
  }

  await template.destroy();

  return res.status(200).json({ message: "Campaign template deleted" });
};
