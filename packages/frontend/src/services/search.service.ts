import { api } from './api';

export interface SearchResult {
  id: string;
  type: 'contact' | 'deal' | 'activity';
  title: string;
  subtitle?: string;
  url: string;
}

export const searchService = {
  async search(q: string): Promise<SearchResult[]> {
    const res = await api.get('/search', { params: { q } });
    return res.data.data;
  },
};
