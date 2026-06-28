import type { SearchWordDto } from "../models/interface";
import type { AutoCompleteState } from "../services/hooks/useAutoComplete";
import { createMatchedIndices } from "../utils/createMatchedIndices";
import { normalizeQuery } from "../utils/normalizeQuery";

type AutoCompleteDropdownProps = {
    query: string;
    state: AutoCompleteState;
    items: SearchWordDto[];
    focusedIndex: number;
    onMouseEnter: (index: number) => void;
    onSelect: (word: SearchWordDto) => void;
};

function HighlightedWord({ value, query }: { value: string; query: string }) {
    const normalizedQuery = normalizeQuery(query);
    const normalizedValue = value.toLocaleLowerCase();
    const matchedIndices = createMatchedIndices(normalizedValue, normalizedQuery);
    const startIndex = matchedIndices[0] ?? -1;
    const endIndex = matchedIndices[1] ?? -1;

    if (startIndex < 0 || endIndex < startIndex) return value;

    return (
        <>
            {value.slice(0, startIndex)}
            <strong className="font-semibold text-slate-950">{value.slice(startIndex, endIndex + 1)}</strong>
            {value.slice(endIndex + 1)}
        </>
    );
}

export function AutoCompleteDropdown({
    query,
    state,
    items,
    focusedIndex,
    onMouseEnter,
    onSelect,
}: AutoCompleteDropdownProps) {
    if (state === "loading") {
        return <div className="px-4 py-3 text-sm text-slate-500">추천 검색어를 불러오는 중...</div>;
    }

    if (state === "error") {
        return <div className="px-4 py-3 text-sm text-red-600">추천 검색어를 가져오지 못했습니다.</div>;
    }

    if (state === "empty") {
        return <div className="px-4 py-3 text-sm text-slate-500">검색 결과가 없습니다.</div>;
    }

    return (
        <ul className="max-h-64 overflow-y-auto py-1">
            {items.map((item, index) => {
                const isFocused = index === focusedIndex;

                return (
                    <li key={item.id}>
                        <button
                            type="button"
                            onMouseEnter={() => onMouseEnter(index)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => onSelect(item)}
                            className={`w-full px-4 py-2.5 text-left text-sm transition ${
                                isFocused ? "bg-slate-100 text-slate-950" : "text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            <HighlightedWord value={item.value} query={query} />
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
