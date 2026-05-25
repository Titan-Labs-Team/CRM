import { db } from '../../db';

export async function listContracts(tenantId: string, contactId: string) {
  return db('contact_contracts')
    .where({ tenant_id: tenantId, contact_id: contactId })
    .select('id', 'original_name', 'file_size', 'mime_type', 'uploaded_at')
    .orderBy('uploaded_at', 'desc');
}

export async function uploadContract(
  tenantId: string,
  contactId: string,
  file: Express.Multer.File,
) {
  const contact = await db('contacts').where({ id: contactId, tenant_id: tenantId }).first('id');
  if (!contact) throw Object.assign(new Error('Contact not found'), { status: 404 });

  const [contract] = await db('contact_contracts')
    .insert({
      contact_id: contactId,
      tenant_id: tenantId,
      original_name: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype,
      file_data: file.buffer,
    })
    .returning(['id', 'original_name', 'file_size', 'mime_type', 'uploaded_at']);

  return contract;
}

export async function downloadContract(tenantId: string, contractId: string) {
  const contract = await db('contact_contracts')
    .where({ id: contractId, tenant_id: tenantId })
    .first();
  if (!contract) throw Object.assign(new Error('Contract not found'), { status: 404 });
  return contract;
}

export async function deleteContract(tenantId: string, contractId: string) {
  const deleted = await db('contact_contracts')
    .where({ id: contractId, tenant_id: tenantId })
    .delete();
  if (!deleted) throw Object.assign(new Error('Contract not found'), { status: 404 });
}
