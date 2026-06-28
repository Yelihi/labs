import { useEffect, useRef, useState } from "react";

import type { SearchWordDto } from "../../models/interface";
import { normalizeQuery } from "../../utils/normalizeQuery";
import { searchCache } from "../cache/MemoryCache";
import { searchWordService } from "../searchWordService";
import { useDebouncedValue } from "./useDebouncedValue";

export type AutoCompleteState = "loading" | "ready" | "empty" | "error";

const emptyItems: SearchWordDto[] = [];

export const useAutoComplete = () => {
    const [query, setQuery] = useState("");
    const [selectedValue, setSelectedValue] = useState("");
    const [state, setState] = useState<AutoCompleteState>("ready");
    const [totalCount, setTotalCount] = useState(0);
    const [items, setItems] = useState<SearchWordDto[]>(emptyItems);
    const debouncedQuery = useDebouncedValue(query, 300);
    const latestReqId = useRef(0);
    const skipNextSearch = useRef(false);

    const resetResult = () => {
        setState("ready");
        setTotalCount(0);
        setItems(emptyItems);
    };

    const requestSearch = async (normalizedQuery: string) => {
        const cached = searchCache.get(normalizedQuery);
        if (cached) return cached;

        const responseDto = await searchWordService(normalizedQuery);
        searchCache.set(normalizedQuery, responseDto);
        return responseDto;
    };

    const updateQuery = (value: string) => {
        skipNextSearch.current = false;
        latestReqId.current += 1;
        setQuery(value);

        if (normalizeQuery(value).length < 2) {
            resetResult();
        }
    };

    const selectValue = (value: string) => {
        skipNextSearch.current = true;
        latestReqId.current += 1;
        setQuery(value);
        setSelectedValue(value);
        resetResult();
    };

    useEffect(() => {
        if (skipNextSearch.current) {
            skipNextSearch.current = false;
            return;
        }

        const normalizedQuery = normalizeQuery(debouncedQuery);

        if (normalizedQuery.length < 2) {
            latestReqId.current += 1;
            resetResult();
            return;
        }

        const currentReqId = latestReqId.current + 1;
        latestReqId.current = currentReqId;

        async function run() {
            const cached = searchCache.get(normalizedQuery);
            if (cached) {
                if (currentReqId !== latestReqId.current) return;

                setTotalCount(cached.total);
                setItems(cached.items);
                setState(cached.items.length > 0 ? "ready" : "empty");
                return;
            }

            setState("loading");

            try {
                const responseDto = await requestSearch(normalizedQuery);
                if (currentReqId !== latestReqId.current) return;

                setTotalCount(responseDto.total);
                setItems(responseDto.items);
                setState(responseDto.items.length > 0 ? "ready" : "empty");
            } catch {
                if (currentReqId !== latestReqId.current) return;

                setTotalCount(0);
                setItems(emptyItems);
                setState("error");
            }
        }

        run();
    }, [debouncedQuery]);

    return {
        query,
        setQuery: updateQuery,
        selectedValue,
        selectValue,
        state,
        pending: state === "loading",
        totalCount,
        items,
    };
};
