import User from "../../../models/User";
import Queue from "../../../models/Queue";
import Whatsapp from "../../../models/Whatsapp";

const recoverableSequelizeErrors = new Set([
  "SequelizeDatabaseError",
  "SequelizeEagerLoadingError"
]);

const isRecoverableRelationLoadError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  return recoverableSequelizeErrors.has(error.name);
};

export const loadUserWithRelations = async (
  userId: string | number
): Promise<User | null> => {
  try {
    return await User.findByPk(userId, {
      attributes: [
        "name",
        "id",
        "email",
        "profile",
        "tokenVersion",
        "whatsappId"
      ],
      include: [
        { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
        { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] }
      ],
      order: [[{ model: Queue, as: "queues" }, "name", "asc"]]
    });
  } catch (error) {
    if (!isRecoverableRelationLoadError(error)) {
      throw error;
    }

    const user = await User.findByPk(userId, {
      attributes: [
        "name",
        "id",
        "email",
        "profile",
        "tokenVersion",
        "whatsappId"
      ]
    });

    if (user) {
      user.setDataValue("queues", []);
      user.setDataValue("whatsapp", null);
    }

    return user;
  }
};
