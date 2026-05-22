export interface ParsedContact {
  fullName: string;
  phone?: string;
  email?: string;
  company?: string;
}

export function parseVCard(text: string): ParsedContact[] {
  const contacts: ParsedContact[] = [];
  const cards = text.split(/BEGIN:VCARD/i).filter((c) => c.trim());

  for (const card of cards) {
    const lines = card.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    let fullName = '';
    let phone = '';
    let email = '';
    let company = '';

    for (const line of lines) {
      const [rawKey, ...rest] = line.split(':');
      const value = rest.join(':').trim();
      const key = rawKey.split(';')[0].toUpperCase();

      if (key === 'FN') fullName = value;
      if (key === 'ORG') company = value.split(';')[0];
      if (key === 'EMAIL' || key.startsWith('EMAIL')) email = email || value;
      if (key === 'TEL' || key.startsWith('TEL')) phone = phone || value.replace(/\D/g, '');
    }

    if (!fullName) continue;

    const digits = phone.slice(-11);
    const formatted =
      digits.length === 11
        ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
        : digits.length === 10
        ? `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
        : phone || undefined;

    contacts.push({
      fullName,
      phone: formatted,
      email: email || undefined,
      company: company || undefined,
    });
  }

  return contacts;
}
