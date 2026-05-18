import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchService, SearchResult } from '@/services/search.service';
import { useDebounce } from './useDebounce';

export function useSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: results = [], isFetching } = useQuery<SearchResult[]>({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchService.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  return { query, setQuery, results, isFetching };
}
