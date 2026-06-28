import { AutoCompleteDropdown } from "./AutoCompleteDropdown";
import { AutoCompleteInput } from "./AutoCompleteInput";
import { useAutoComplete } from "../services/hooks/useAutoComplete";
import { useAutoCompleteInteraction } from "../services/hooks/useAutoCompleteInteraction";

export function SearchContainer() {
    const autoComplete = useAutoComplete();
    const interaction = useAutoCompleteInteraction({
        query: autoComplete.query,
        state: autoComplete.state,
        items: autoComplete.items,
        onSelect: autoComplete.selectValue,
    });

    return (
        <div className="w-full max-w-md">
            <div className="relative">
                <AutoCompleteInput
                    value={autoComplete.query}
                    onChange={autoComplete.setQuery}
                    onFocus={interaction.open}
                    onBlur={interaction.close}
                    onKeyDown={interaction.handleKeyDown}
                />

                {interaction.isOpen ? (
                    <div className="absolute left-0 right-0 top-14 z-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                        <AutoCompleteDropdown
                            query={autoComplete.query}
                            state={autoComplete.state}
                            items={autoComplete.items}
                            focusedIndex={interaction.focusedIndex}
                            onMouseEnter={interaction.handleMouseEnter}
                            onSelect={interaction.selectWord}
                        />
                    </div>
                ) : null}
            </div>

            {autoComplete.selectedValue ? (
                <p className="mt-3 text-sm text-slate-500">
                    선택한 검색어: <span className="font-medium text-slate-900">{autoComplete.selectedValue}</span>
                </p>
            ) : null}
        </div>
    );
}
