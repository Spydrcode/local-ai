/**
 * Operations Signal Extractor
 * 
 * Analyzes operational friction points from scraped website data:
 * - Contact accessibility (phone, email, forms)
 * - Business hours visibility
 * - Service listings
 * - Booking/scheduling capabilities
 */

export interface OperationsSignal {
  icon: string;
  message: string;
  type: 'positive' | 'negative' | 'warning';
}

export function extractOperationsSignals(data: any): string[] {
  const signals: string[] = [];

  // Contact phone accessibility
  if (data.business?.phone) {
    signals.push(`✓ Contact phone displayed`);
  } else {
    signals.push(`❌ No phone number found`);
  }

  // Contact methods
  if (data.business?.email || data.business?.contactForm) {
    signals.push(`✓ Contact method available`);
  } else {
    signals.push(`❌ No easy way to contact`);
  }

  // Business hours
  if (data.business?.hours) {
    signals.push(`✓ Business hours listed`);
  } else {
    signals.push(`⚠️ Business hours not shown`);
  }

  // Service listings
  if (data.business?.services?.length > 0) {
    signals.push(`✓ ${data.business.services.length} services listed`);
  }

  // Online booking (rarely detected automatically, so we flag it as missing)
  signals.push(`⚠️ Online booking not detected`);

  return signals.slice(0, 5);
}

/**
 * Generate basic operations signals for businesses without websites
 */
export function generateBasicOperationsSignals(): string[] {
  return [
    "⚠️ No online booking or contact form - customers can't reach you easily",
    "⚠️ Business hours not displayed online",
    "❌ No online presence for emergency/after-hours inquiries"
  ];
}
