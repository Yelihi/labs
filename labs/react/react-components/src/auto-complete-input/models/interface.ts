export interface SearchWordDto {
    id: string;
    value: string;
}

export interface AutoComplateSearchResponseDto {
    total: number;
    items: SearchWordDto[];
}