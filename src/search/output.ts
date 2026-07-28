// Field names match the wire shape read directly from anakin-py's
// src/anakin/models.py (SearchResult / SearchResultItem) — the reference SDK
// implementation for this same API, not guessed from the endpoint name.
export type SearchResultItem = {
  url: string;
  title?: string;
  snippet?: string;
  date?: string;
  lastUpdated?: string;
};

export type SearchOutput = {
  id: string;
  results: SearchResultItem[];
};
