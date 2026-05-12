import Contact from "../../models/Contact";

const ListAllContactsService = async (): Promise<Contact[]> => {
  const contacts = await Contact.findAll({
    attributes: ["id", "name", "number", "email", "isGroup"],
    order: [["name", "ASC"]]
  });

  return contacts;
};

export default ListAllContactsService;
