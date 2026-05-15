/** Statuts DB (enum commande_statut) */
export const DELETABLE_ORDER_STATUSES = ['en_attente', 'annulee'] as const;

export function canUserDeleteOrder(statut: string): boolean {
  return DELETABLE_ORDER_STATUSES.includes(statut as (typeof DELETABLE_ORDER_STATUSES)[number]);
}

export function getOrderStatusLabel(statut: string, locale: 'fr' | 'en' = 'fr'): string {
  const labels: Record<string, { fr: string; en: string }> = {
    en_attente: { fr: 'En attente', en: 'Pending' },
    paiement_recu: { fr: 'Paiement reçu', en: 'Payment received' },
    en_preparation: { fr: 'En préparation', en: 'In preparation' },
    expediee: { fr: 'Expédiée', en: 'Shipped' },
    livree: { fr: 'Livrée', en: 'Delivered' },
    annulee: { fr: 'Annulée', en: 'Cancelled' },
    remboursee: { fr: 'Remboursée', en: 'Refunded' },
    pending: { fr: 'En attente', en: 'Pending' },
    processing: { fr: 'En cours', en: 'Processing' },
    shipped: { fr: 'Expédiée', en: 'Shipped' },
    delivered: { fr: 'Livrée', en: 'Delivered' },
    cancelled: { fr: 'Annulée', en: 'Cancelled' },
  };
  return labels[statut]?.[locale] ?? statut;
}

export function getOrderStatusColor(statut: string): string {
  switch (statut) {
    case 'en_attente':
    case 'pending':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'paiement_recu':
    case 'en_preparation':
    case 'processing':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'expediee':
    case 'shipped':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'livree':
    case 'delivered':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case 'annulee':
    case 'remboursee':
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300';
  }
}

export function normalizeOrderForClient(order: Record<string, unknown>) {
  const items = (order.commande_items as Array<Record<string, unknown>>) || [];
  return {
    ...order,
    numero: order.numero_commande ?? order.numero,
    total: order.total_commande ?? order.total,
    items: items.map((item) => ({
      id: item.id,
      name: item.produit_nom,
      product_name: item.produit_nom,
      quantity: item.quantite,
      price: item.prix_unitaire,
      image: item.produit_image_url,
    })),
  };
}
