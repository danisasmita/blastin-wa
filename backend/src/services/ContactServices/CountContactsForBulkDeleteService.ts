import { Op, Sequelize } from "sequelize";
import Contact from "../../models/Contact";

interface Request {
  contactIds?: number[];
  searchParam?: string;
}

const CountContactsForBulkDeleteService = async ({
  contactIds = [],
  searchParam = ""
}: Request): Promise<number> => {
  if (contactIds.length > 0) {
    return Contact.count({
      where: {
        id: contactIds
      }
    });
  }

  const trimmedSearchParam = searchParam.toLowerCase().trim();

  if (!trimmedSearchParam) {
    return 0;
  }

  return Contact.count({
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
};

export default CountContactsForBulkDeleteService;
