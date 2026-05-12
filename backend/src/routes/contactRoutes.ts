import express from "express";
import isAuth from "../middleware/isAuth";

import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";

const contactRoutes = express.Router();

contactRoutes.post(
  "/contacts/import",
  isAuth,
  ImportPhoneContactsController.store
);

contactRoutes.get("/contacts", isAuth, ContactController.index);
contactRoutes.get("/contacts/all", isAuth, ContactController.listAll);

contactRoutes.get("/contacts/:contactId", isAuth, ContactController.show);

contactRoutes.post("/contacts", isAuth, ContactController.store);
contactRoutes.post(
  "/contacts/bulk-delete/preview",
  isAuth,
  ContactController.bulkRemovePreview
);
contactRoutes.post("/contacts/bulk-delete", isAuth, ContactController.bulkRemove);

contactRoutes.post("/contact", isAuth, ContactController.getContact);

contactRoutes.put("/contacts/:contactId", isAuth, ContactController.update);

contactRoutes.delete("/contacts/:contactId", isAuth, ContactController.remove);

export default contactRoutes;
