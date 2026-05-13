import User from "../../models/User";
import AppError from "../../errors/AppError";
import { loadUserWithRelations } from "./helpers/loadUserWithRelations";

const ShowUserService = async (id: string | number): Promise<User> => {
  const user = await loadUserWithRelations(id);
  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return user;
};

export default ShowUserService;
