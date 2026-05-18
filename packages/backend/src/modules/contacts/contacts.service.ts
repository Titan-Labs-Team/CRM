import { db } from '../../db';
import { getPaginationParams, paginatedResponse } from '../../shared/utils/paginate';
import type { CreateContactInput, UpdateContactInput, ListContactsQuery } from './contacts.schema';
import { fireWebhook } from '../integrations/integrations.service';

export async function listContacts(tenantId: string, query: ListContactsQuery) {
  const { page, limit, offset } = getPaginationParams(query);

  let base = db('contacts as c')
    .leftJoin('users as u', 'c.owner_id', 'u.id')
    .where('c.tenant_id', tenantId)
    .select(
      'c.id',
      'c.type',
      'c.full_name',
      'c.email',
      'c.phone',
      'c.company_name',
      'c.job_title',
      'c.source',
      'c.tags',
      'c.owner_id',
      'c.created_at',
      'c.updated_at',
      db.raw("u.full_name as owner_name"),
    );

  if (query.type) base = base.where('c.type', query.type);
  if (query.owner) base = base.where('c.owner_id', query.owner);
  if (query.search) {
    const term = `%${query.search}%`;
    base = base.where((q) =>
      q
        .whereILike('c.full_name', term)
        .orWhereILike('c.email', term)
        .orWhereILike('c.company_name', term),
    );
  }

  const countQuery = db('contacts').where('tenant_id', tenantId);
  if (query.type) countQuery.where('type', query.type);
  if (query.owner) countQuery.where('owner_id', query.owner);
  if (query.search) {
    const term = `%${query.search}%`;
    countQuery.where((q) =>
      q
        .whereILike('full_name', term)
        .orWhereILike('email', term)
        .orWhereILike('company_name', term),
    );
  }
  const [{ count }] = await countQuery.count('id as count');

  const contacts = await base.orderBy('c.created_at', 'desc').limit(limit).offset(offset);

  return paginatedResponse(contacts, Number(count), page, limit);
}

export async function getContact(tenantId: string, id: string) {
  const contact = await db('contacts as c')
    .leftJoin('users as u', 'c.owner_id', 'u.id')
    .where({ 'c.id': id, 'c.tenant_id': tenantId })
    .select(
      'c.*',
      db.raw("u.full_name as owner_name"),
      db.raw("u.email as owner_email"),
    )
    .first();

  if (!contact) throw Object.assign(new Error('Contact not found'), { status: 404 });
  return contact;
}

export async function createContact(tenantId: string, input: CreateContactInput) {
  const [contact] = await db('contacts')
    .insert({
      tenant_id: tenantId,
      type: input.type,
      full_name: input.fullName,
      email: input.email || null,
      phone: input.phone || null,
      company_name: input.companyName || null,
      job_title: input.jobTitle || null,
      source: input.source || null,
      tags: input.tags ? JSON.stringify(input.tags) : '{}',
      owner_id: input.ownerId || null,
      custom_fields: input.customFields ? JSON.stringify(input.customFields) : '{}',
    })
    .returning('*');

  fireWebhook(tenantId, 'contact.created', contact).catch(() => {});
  return contact;
}

export async function updateContact(
  tenantId: string,
  id: string,
  input: UpdateContactInput,
) {
  const updates: Record<string, unknown> = { updated_at: new Date() };
  if (input.type !== undefined) updates.type = input.type;
  if (input.fullName !== undefined) updates.full_name = input.fullName;
  if (input.email !== undefined) updates.email = input.email || null;
  if (input.phone !== undefined) updates.phone = input.phone || null;
  if (input.companyName !== undefined) updates.company_name = input.companyName || null;
  if (input.jobTitle !== undefined) updates.job_title = input.jobTitle || null;
  if (input.source !== undefined) updates.source = input.source || null;
  if (input.tags !== undefined) updates.tags = JSON.stringify(input.tags);
  if (input.ownerId !== undefined) updates.owner_id = input.ownerId || null;
  if (input.customFields !== undefined) updates.custom_fields = JSON.stringify(input.customFields);

  const [contact] = await db('contacts')
    .where({ id, tenant_id: tenantId })
    .update(updates)
    .returning('*');

  if (!contact) throw Object.assign(new Error('Contact not found'), { status: 404 });
  fireWebhook(tenantId, 'contact.updated', contact).catch(() => {});
  return contact;
}

export async function deleteContact(tenantId: string, id: string) {
  const deleted = await db('contacts').where({ id, tenant_id: tenantId }).delete();
  if (!deleted) throw Object.assign(new Error('Contact not found'), { status: 404 });
  fireWebhook(tenantId, 'contact.deleted', { id }).catch(() => {});
}

export async function importContactsCsv(
  tenantId: string,
  buffer: Buffer,
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const { parse } = await import('csv-parse/sync');

  const rows = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const fullName = row['Name'] || row['full_name'] || row['nome'];
    if (!fullName) { skipped++; continue; }

    const email = row['Email'] || row['email'] || null;
    if (email) {
      const existing = await db('contacts').where({ tenant_id: tenantId, email }).first();
      if (existing) { skipped++; continue; }
    }

    try {
      await db('contacts').insert({
        tenant_id: tenantId,
        full_name: fullName,
        email: email || null,
        phone: row['Phone'] || row['phone'] || row['telefone'] || null,
        company_name: row['Company'] || row['company_name'] || row['empresa'] || null,
        job_title: row['Job Title'] || row['job_title'] || row['cargo'] || null,
        type: (row['Type'] || row['type'] || 'lead') as 'lead' | 'contact' | 'client',
        source: row['Source'] || row['source'] || null,
        tags: '{}',
        custom_fields: '{}',
      });
      imported++;
    } catch {
      errors.push(`Linha ${i + 2}: erro ao importar "${fullName}"`);
    }
  }

  return { imported, skipped, errors };
}

export async function exportContactsCsv(tenantId: string): Promise<string> {
  const contacts = await db('contacts')
    .where({ tenant_id: tenantId })
    .select('full_name', 'email', 'phone', 'company_name', 'job_title', 'type', 'source', 'created_at')
    .orderBy('created_at', 'desc');

  const { stringify } = await import('csv-stringify/sync');
  return stringify(contacts, {
    header: true,
    columns: [
      { key: 'full_name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'company_name', header: 'Company' },
      { key: 'job_title', header: 'Job Title' },
      { key: 'type', header: 'Type' },
      { key: 'source', header: 'Source' },
      { key: 'created_at', header: 'Created At' },
    ],
  });
}
