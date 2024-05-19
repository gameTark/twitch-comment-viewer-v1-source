import DataLoader from "dataloader";

/**
 * ref https://qiita.com/kyusyukeigo/items/b0c97c8e9ca6d84bf4f9
 */
export abstract class BaseDataLoader<K, V> {
  protected readonly dataloader: DataLoader<K, V> = new DataLoader<K, V>(this.batchLoad.bind(this));

  public clear(key: K): DataLoader<K, V> {
    return this.dataloader.clear(key);
  }

  public clearAll(): DataLoader<K, V> {
    return this.dataloader.clearAll();
  }

  public async load(key: K): Promise<V> {
    return this.dataloader.load(key);
  }

  public async loadMany(keys: K[]): Promise<(V | Error)[]> {
    return keys.length > 0 ? this.dataloader.loadMany(keys) : [];
  }

  public prime(key: K, value: V): DataLoader<K, V> {
    return this.dataloader.prime(key, value);
  }

  protected abstract batchLoad(keys: ReadonlyArray<K>): ReturnType<DataLoader.BatchLoadFn<K, V>>;
}
