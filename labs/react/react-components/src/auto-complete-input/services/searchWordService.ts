import { AutoComplateSearchResponseDto } from "../models/interface";
import { mockWords } from "./mockWords";

export const timer = (ms: number) => new Promise((resolve) => setTimeout(() => resolve(true), ms))

/**
 * mockWords 를 promise 기반으로 제공하는 service 예시 함수
 */
export const searchWordService = async (normalizeQuery: string): Promise<AutoComplateSearchResponseDto> => {
    // mockWords 배열 검색 쿼리 기반으로 filtering
    const queryPattern = new RegExp(normalizeQuery, "gi");
    const filteredWords = mockWords.filter((word) => {
        return word.match(queryPattern);
    });

    // 자체적인 딜레이
    await timer(1000);

    return {
        total: filteredWords.length,
        items: filteredWords.map((word) => {
            return {
                id: word,
                value: word,
            };
        }),
    };
}