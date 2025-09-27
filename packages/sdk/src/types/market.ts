/**
 * Centralized market types with discriminated union for different market presentations
 * Supports binary "chance" markets and "group/rows" markets
 */

export type UiStyle = "default" | "binary";

export interface BaseMarket {
  id: string;
  question: string;
  poolUsd: number;
  imageUrl?: string;
  closesAt?: string;
  outcomes?: Array<{ label: string; oddsPct: number }>;
}

export type MarketItem =
  | ({
      kind: "market";
      uiStyle?: UiStyle; // default or chance
    } & BaseMarket)
  | ({
      kind: "group";
      groupId: string;
      title: string;
      members: Array<{
        label: string;
        marketId: string; // points to a MarketItem with kind:"market"
      }>;
    });

export function isGroup(item: MarketItem): item is Extract<MarketItem, { kind: "group" }> {
  return item.kind === "group";
}

