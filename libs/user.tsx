import { DBUser } from "@schemas/twitch/User";

import { getUsers } from "@resource/twitchWithDb";

import { BaseDataLoader } from "./dataloader";

export class UserDataLoader extends BaseDataLoader<DBUser["id"], DBUser> {
  protected async batchLoad(keys: DBUser["id"][]): Promise<(DBUser | Error)[]> {
    const users = await getUsers(keys);
    return users;
  }
}
