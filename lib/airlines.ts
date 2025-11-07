export const COMMERCIAL_PREFIXES = [
  // United States
  'AAL', 'UAL', 'DAL', 'SWA', 'JBU', 'ASA', 'SKW', 'FFT', 'ENY', 'PDT',
  // Europe
  'BAW', 'EZY', 'RYR', 'AFR', 'DLH', 'KLM', 'IBE', 'AEE', 'SAS', 'FIN',
  // Asia-Pacific
  'ANA', 'JAL', 'CPA', 'SIA', 'QFA', 'THA', 'KAL', 'AAR', 'CSN', 'CES',
  // Middle East
  'UAE', 'ETD', 'QTR', 'SVA', 'MEA',
  // Latin America
  'AZU', 'TAM', 'GOL', 'LAN', 'ARE', 'AMX',
  // Canada
  'ACA', 'WJA', 'TSC',
  // Low-cost carriers
  'VOI', 'WZZ', 'NYX', 'ROU', 'BEE',
];

export function isCommercialFlight(callsign: string | null): boolean {
  if (!callsign) return false;
  const cleaned = callsign.trim().toUpperCase();
  return COMMERCIAL_PREFIXES.some(prefix => cleaned.startsWith(prefix));
}