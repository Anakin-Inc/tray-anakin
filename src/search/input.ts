export type SearchInput = {
  /**
   * @title Prompt
   * @description The search query or question.
   */
  prompt: string;
  /**
   * @title Limit
   * @description Maximum number of results to return.
   * @default 5
   */
  limit?: number;
};
