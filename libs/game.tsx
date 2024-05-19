import { DBGame } from "@schemas/twitch/Game";

import { getGames } from "@resource/twitchWithDb";

import { BaseDataLoader } from "./dataloader";

export class GameDataloader extends BaseDataLoader<DBGame["id"], DBGame> {
  protected async batchLoad(keys: DBGame["id"][]): Promise<(DBGame | Error)[]> {
    const games = await getGames(keys);
    return games;
  }
}
