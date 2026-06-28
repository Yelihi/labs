import { SearchCache } from './cache';
import { AutoComplateSearchResponseDto } from '../../models/interface';

/**
 * cache 구현체
 */

export class MemorySearchCache extends SearchCache<AutoComplateSearchResponseDto> {

    set(key: string, value: AutoComplateSearchResponseDto, ttl?: number) {
        const now = Date.now();
        const timeToLive = ttl || 60000;
        this.map.set(key, { value, ttl: timeToLive, createdAt: now })
    }

    get(key: string) {
        const cacheValue = this.map.get(key);

        if (!cacheValue) return null;
        const { value, ttl, createdAt } = cacheValue;

        const now = Date.now();
        const isExpired = now - createdAt > ttl;

        if (isExpired) {
            this.map.delete(key);
            return null;
        }

        return value;
    }

    delete(key: string) {
        this.map.delete(key);
    }

    clear() {
        this.map.clear();
    }

    has(key: string) {
        return this.map.has(key);
    }

    size() {
        return this.map.size;
    }

}

// singleton
export const searchCache = Object.freeze(new MemorySearchCache())