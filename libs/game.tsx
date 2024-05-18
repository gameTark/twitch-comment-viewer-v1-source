import { getGames } from "@resource/twitchWithDb";
import { BaseDataLoader } from "./dataloader";
import { DBGame } from "@schemas/twitch/Game";
export class GameDataloader extends BaseDataLoader<DBGame["id"], DBGame> {
  protected async batchLoad(keys: DBGame["id"][]): Promise<(DBGame | Error)[]> {
    const games = await getGames(keys);
    return games;
  }
}
