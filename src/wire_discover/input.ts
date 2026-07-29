export type WireDiscoverInput = {
  /**
   * @title Query
   * @description The intent in natural language, e.g. "top phones on walmart", "search airbnb listings in Lisbon".
   */
  q: string;
  /**
   * @title Limit
   * @description Maximum number of candidate actions to return.
   * @default 5
   */
  limit?: number;
};
