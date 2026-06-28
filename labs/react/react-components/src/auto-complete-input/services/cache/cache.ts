
export interface CacheValue<T> {
    value: T;
    ttl: number;
    createdAt: number;
}

export abstract class SearchCache<T> {
    protected map: Map<string, CacheValue<T>> = new Map();

    abstract set(key: string, value: T, ttl?: number): void;
    abstract get(key: string): T | null;
    abstract delete(key: string): void;
    abstract clear(): void;
    abstract has(key: string): boolean;
    abstract size(): number;
}