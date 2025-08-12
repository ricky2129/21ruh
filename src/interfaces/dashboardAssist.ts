export interface HistoryItem {
  id: number;
  prompt: string;
  created_at: string;
  grafana_url?: string;
  dashboard_url?: string;
  panel_links?: string[];
}