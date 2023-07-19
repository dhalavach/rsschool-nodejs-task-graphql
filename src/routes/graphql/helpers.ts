export class Cache<K, V> {
  constructor(maxEntries: number) {
    this.maxEntries = maxEntries;
  }

  // If a custom cache is provided, it must be of this type (a subset of ES6 Map).
  // export type CacheMap<K, V> = {
  //   get(key: K): V | void;
  //   set(key: K, value: V): any;
  //   delete(key: K): any;
  //   clear(): any;
  // };

  values: Map<K, V> = new Map<K, V>();
  maxEntries: number;

  public get(key: K): V | void {
    console.log('get value in cache has been called...');

    let entry: V | undefined;
    if (this.values.has(key)) {
      entry = this.values.get(key);
      this.values.delete(key);
      this.values.set(key, entry as V);
    }
    return entry as V;
  }

  public set(key: K, value: V): any {
    console.log('set value in cache has been called...');
    if (this.values.size >= this.maxEntries) {
      const keyToDelete = this.values.keys().next().value;
      this.values.delete(keyToDelete);
    }
    this.values.set(key, value);
  }

  public clear(): boolean {
    try {
      this.values.clear();
      return true;
    } catch (error) {
      return false;
    }
  }

  public delete(key: K): boolean {
    try {
      this.values.delete(key);
      return true;
    } catch (error) {
      return false;
    }
  }
}
