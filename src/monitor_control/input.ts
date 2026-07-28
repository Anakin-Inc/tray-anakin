export type MonitorControlInput = {
  /**
   * @title Monitor ID
   * @description The monitor ID (from Monitor: List or Monitor: Create).
   */
  id: string;
  /**
   * @title Action
   * @description What to do with the monitor.
   */
  action: "pause" | "resume" | "run_now" | "delete";
};
