export type BarInfo = {
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
  isUp: boolean;
  isHaUp: boolean;

  isNextOpenHigher?: boolean;
  isUpPotential?: boolean;
  isUpEntry?: boolean;
};
