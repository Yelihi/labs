import type { ChangeEvent, FocusEvent, KeyboardEvent } from "react";

type AutoCompleteInputProps = {
    value: string;
    onChange: (value: string) => void;
    onFocus: () => void;
    onBlur: (event: FocusEvent<HTMLInputElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export function AutoCompleteInput({
    value,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
}: AutoCompleteInputProps) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <input
            type="search"
            value={value}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            placeholder="검색어를 입력하세요"
            aria-label="검색어"
            autoComplete="off"
            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
        />
    );
}
