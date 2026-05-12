import { Op, Sequelize } from "sequelize";
import Contact from "../../models/Contact";

interface Request {
  contactIds?: number[];
  searchParam?: string;
}

const BulkDeleteContactsService = async ({
  contactIds = [],
  searchParam = ""
}: Request): Promise<number[]> => {
  let contacts: Contact[] = [];

  if (contactIds.length > 0) {
    contacts = await Contact.findAll({
      where: {
        id: contactIds
      }
    });
  } else {
    const trimmedSearchParam = searchParam.toLowerCase().trim();

    if (!trimmedSearchParam) {
      return [];
    }

    contacts = await Contact.findAll({
      where: {
        [Op.or]: [
          {
            name: Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.col("name")),
              "LIKE",
              `%${trimmedSearchParam}%`
            )
          },
          {
            number: {
              [Op.like]: `%${trimmedSearchParam}%`
            }
          }
        ]
      }
    });
  }

  const deletedIds: number[] = [];

  for (const contact of contacts) {
    await contact.destroy();
    deletedIds.push(contact.id);
  }

  return deletedIds;
};

export default BulkDeleteContactsService;
