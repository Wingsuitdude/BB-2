export function truncateAddress(address, start = 6, end = 4) {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}