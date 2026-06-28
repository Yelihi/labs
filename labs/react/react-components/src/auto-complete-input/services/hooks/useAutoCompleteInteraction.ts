import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";

import type { SearchWordDto } from "../../models/interface";
import { normalizeQuery } from "../../utils/normalizeQuery";
import type { AutoCompleteState } from "./useAutoComplete";

type UseAutoCompleteInteractionParams = {
    query: string;
    state: AutoCompleteState;
    items: SearchWordDto[];
    onSelect: (value: string) => void;
};

export const useAutoCompleteInteraction = ({
    query,
    state,
    items,
    onSelect,
}: UseAutoCompleteInteractionParams) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const canOpen = normalizeQuery(query).length >= 2 && (state !== "ready" || items.length > 0);

    const open = () => {
        if (canOpen) setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    useEffect(() => {
        if (canOpen) {
            setIsOpen(true);
            return;
        }

        close();
    }, [canOpen]);

    const selectWord = (word: SearchWordDto) => {
        onSelect(word.value);
        close();
    };

    const handleMouseEnter = (index: number) => {
        setFocusedIndex(index);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || items.length === 0) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setFocusedIndex((index) => (index + 1) % items.length);
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            setFocusedIndex((index) => (index <= 0 ? items.length - 1 : index - 1));
            return;
        }

        if (event.key === "Enter" && focusedIndex >= 0) {
            event.preventDefault();
            const focusedItem = items[focusedIndex];
            if (focusedItem) selectWord(focusedItem);
        }

        if (event.key === "Escape") {
            close();
        }
    };

    return {
        isOpen: isOpen && canOpen,
        open,
        close,
        focusedIndex,
        setFocusedIndex,
        handleMouseEnter,
        handleKeyDown,
        selectWord,
    };
};
