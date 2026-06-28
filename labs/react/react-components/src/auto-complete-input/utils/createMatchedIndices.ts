export function createMatchedIndices(matchedWord: string, query: string): number[] {
    const startIndex = matchedWord.indexOf(query);
    const endIndex = startIndex + query.length - 1;

    return [startIndex, endIndex];
}