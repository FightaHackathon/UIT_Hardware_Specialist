export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export type ComponentCategory = 'CPU' | 'GPU' | 'Motherboard' | 'RAM' | 'Storage' | 'PSU' | 'Case' | 'Laptop';
export type DeviceType = 'Desktop' | 'Laptop';
export type Language = 'en' | 'my';

export interface ComponentPart {
  id: string;
  name: string;
  price?: number;
  specs?: string; // Short spec summary for display
  battery?: string; // Battery life estimate for laptops
  major?: string; // Recommended major (from CSV)
  activities?: string; // Recommended activities (from CSV)
  programList?: string; // List of programs (from CSV)
}

export interface PCBuild {
  type: DeviceType;
  // Desktop Parts
  cpu: ComponentPart | null;
  gpu: ComponentPart | null;
  motherboard: ComponentPart | null;
  ram: ComponentPart | null;
  storage: ComponentPart | null;
  psu: ComponentPart | null;
  pcCase: ComponentPart | null;
  // Laptop
  laptop: ComponentPart | null;
}