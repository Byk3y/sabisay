/**
 * Admin-specific types for events management
 */

export type EventStatus =
  | 'draft'
  | 'pending'
  | 'onchain'
  | 'live'
  | 'closed'
  | 'resolved'
  | 'archived';

export interface EventOutcome {
  id: string;
  event_id: string;
  label: string;
  idx: number;
  color?: string | null;
  created_at: string;
}

export interface EventListItem {
  id: string;
  slug: string;
  title: string;
  question: string;
  type: 'binary' | 'multi';
  status: EventStatus;
  close_time: string;
  created_at: string;
  market_address: string | null;
  tx_hash: string | null;
  creator_user_id: string | null;
}

export interface EventDetail extends EventListItem {
  description?: string | null;
  rules?: string | null;
  image_url?: string | null;
  image_cid?: string | null;
  event_outcomes: EventOutcome[];
  resolved_at?: string | null;
  winning_outcome_idx?: number | null;
  evidence_url?: string | null;
  evidence_cid?: string | null;
  resolution_notes?: string | null;
  archived_at?: string | null;
  previous_status?: string | null;
  chain_id: number;
  fee_bps?: number | null;
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

export interface EventAction {
  id: string;
  action: 'publish' | 'close' | 'archive' | 'resolve';
}
