export type RegisterStatus =
  | 'Not started'
  | 'Draft'
  | 'In review'
  | 'Approved'
  | 'Changes requested';

export type RegisterRow = {
  id: string;
  component: string;
  layer: string;
  usedIn: string;
  status: RegisterStatus;
  date: string;
  notes: string;
};

export declare const REGISTER_PATH: string;
export declare const STATUS_TAGS: Record<RegisterStatus, string | null>;
export declare const TAG_VALUES: string[];
export declare function readRegister(path?: string): RegisterRow[];
