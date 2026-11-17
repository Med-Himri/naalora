import type { OrderStatus } from "@/lib/types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  nouveau: "Nouveau",
  confirme: "Confirmé",
  expedie: "Expédié",
  livre: "Livré",
  annule: "Annulé",
};

export const STATUS_STYLES: Record<OrderStatus, string> = {
  nouveau: "bg-accent-dark text-paper",
  confirme: "bg-brown text-paper",
  expedie: "bg-[#2f5d8a] text-paper",
  livre: "bg-[#17834a] text-paper",
  annule: "bg-line text-ink",
};
