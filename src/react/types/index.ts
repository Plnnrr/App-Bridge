export interface AppTab {
  id: string;
  label: string;
  route: string;
  icon?: string; // Optional icon name
}

export interface PlnnrrIntegrationConfig {
  tabs: AppTab[];
}

export interface PlnnrrIntegrationContextType {
  token: string | null;
  language: string;
  isReady: boolean;
  sendConfig: (config: PlnnrrIntegrationConfig) => void;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
