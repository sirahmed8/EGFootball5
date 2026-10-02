import { toast } from 'sonner';

interface ExportCsvData {
  grossRevenue: number;
  paidVipUsersCount: number;
  paidMRR: number;
  giftedVipUsersCount: number;
  giftedCostPerMonth: number;
  totalVipDiscounts: number;
  pendingReimbursements: number;
  settledReimbursements: number;
  netProfit: number;
  usersCount: number;
  allVipCount: number;
  confirmedCount: number;
  cancelledCount: number;
  totalAiRequests: number;
  totalAiTokens: number;
  estimatedAiCost: number;
  isArabic: boolean;
}

export function exportAnalyticsCSV(data: ExportCsvData) {
  const rows = [
    ['Metric', 'Value'],
    ['Gross Booking Revenue', `EGP ${data.grossRevenue}`],
    ['Paid VIP Subscribers', data.paidVipUsersCount],
    ['Paid VIP MRR', `EGP ${data.paidMRR}`],
    ['Gifted VIP Members', data.giftedVipUsersCount],
    ['Gifted VIP Opportunity Cost / mo', `EGP ${data.giftedCostPerMonth}`],
    ['Total VIP Discounts Granted', `EGP ${data.totalVipDiscounts}`],
    ['Pending Pitch Reimbursements', `EGP ${data.pendingReimbursements}`],
    ['Settled Pitch Reimbursements', `EGP ${data.settledReimbursements}`],
    ['Net Platform Profit', `EGP ${data.netProfit}`],
    ['Total Registered Players', data.usersCount],
    ['Active VIP Members (all)', data.allVipCount],
    ['Confirmed Bookings', data.confirmedCount],
    ['Cancelled Bookings', data.cancelledCount],
    ['Total AI Requests', data.totalAiRequests],
    ['Total AI Tokens Used', data.totalAiTokens],
    ['Estimated AI API Cost', `$${data.estimatedAiCost.toFixed(4)}`],
  ]
    .map((r) => r.join(','))
    .join('\n');

  const blob = new Blob([rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `egfootball5_analytics_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast.success(data.isArabic ? 'تم تصدير التقرير بنجاح' : 'Report exported successfully!');
}
