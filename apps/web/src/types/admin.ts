/**
 * Admin-specific types for events management
 */

export interface EventListItem {
  id: string;
  slug: string;
  title: string;
  type: 'binary' | 'multi';
  status: 'draft' | 'pending' | 'onchain' | 'live' | 'closed' | 'resolved';
  close_time: string;
  created_at: string;
  market_address: string | null;
  tx_hash: string | null;
  creator_user_id: string | null;
}

export interface EventsListResponse {
  items: EventListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EventsListParams {
  q?: string; // Search query
  status?: string[]; // Status filter
  createdFrom?: string; // Date range start
  createdTo?: string; // Date range end
  sort?: 'created_at' | 'close_time' | 'status' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
}

export type EventStatus = EventListItem['status'];

export interface EventAction {
  id: string;
  action: 'publish' | 'close';
}



