import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  statusSlug: string;
  statusText: string;
}

export function OrderStatusBadge({ statusSlug, statusText }: OrderStatusBadgeProps) {
  // Normalize status slug to handle both Salla and Zid common statuses
  const normalizedSlug = statusSlug.toLowerCase();
  
  let colorClasses = '';

  if (['completed', 'delivered', 'shipped'].includes(normalizedSlug)) {
    // Green for success/completed
    colorClasses = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  } else if (['under_review', 'pending', 'new', 'in_progress', 'processing', 'ready'].includes(normalizedSlug)) {
    // Orange/Yellow for pending/in progress
    colorClasses = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  } else if (['canceled', 'returned', 'refunded', 'rejected'].includes(normalizedSlug)) {
    // Red for canceled/rejected
    colorClasses = 'bg-red-500/10 text-red-600 border-red-500/20';
  } else if (['pending_payment', 'unpaid'].includes(normalizedSlug)) {
    // Blue for waiting payment
    colorClasses = 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  } else {
    // Default grey for unknown
    colorClasses = 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }

  return (
    <Badge variant="outline" className={`font-semibold shrink-0 ${colorClasses}`}>
      {statusText}
    </Badge>
  );
}
