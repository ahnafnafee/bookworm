export class LRU<K, V> {
    private readonly max: number;
    private readonly map = new Map<K, V>();

    constructor(max: number) {
        if (max <= 0) throw new Error("LRU max must be > 0");
        this.max = max;
    }

    get(key: K): V | undefined {
        const value = this.map.get(key);
        if (value === undefined) return undefined;
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    set(key: K, value: V): void {
        if (this.map.has(key)) {
            this.map.delete(key);
        } else if (this.map.size >= this.max) {
            const oldest = this.map.keys().next().value;
            if (oldest !== undefined) this.map.delete(oldest);
        }
        this.map.set(key, value);
    }

    delete(key: K): void {
        this.map.delete(key);
    }

    clear(): void {
        this.map.clear();
    }

    get size(): number {
        return this.map.size;
    }
}
