// Origin Books Publishing — the one place the brand's name and default contact
// details live. Contact details shown on the site are edited by the team in the
// dashboard (Website content → Contact details); these are only the defaults.

export const BRAND = {
  name: 'Origin Books Publishing',
  short: 'Origin',
  tagline: 'Where every book begins',
  line: 'Books Publishing',
  domain: 'originbookspublishing.com',
  series: 'Origin Edition',
};

export const DEFAULT_CONTACT = {
  email: 'info@originbookspublishing.com',
  // Add offices from the dashboard. Each: { id, region, phone, address } where
  // address is one line per row.
  offices: [],
};

/** Phone number as a tel: link target ("+44 20 7946 0000" → "+442079460000"). */
export const telHref = (phone) => `tel:${String(phone || '').replace(/[^\d+]/g, '')}`;

/** The contact block from site content, falling back to the defaults. */
export function contactOf(content) {
  const c = content?.contact || {};
  return {
    email: (c.email || '').trim() || DEFAULT_CONTACT.email,
    offices: (Array.isArray(c.offices) ? c.offices : []).filter((o) => o && (o.phone || o.address)),
  };
}
