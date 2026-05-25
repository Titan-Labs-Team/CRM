import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as ContractsService from './contracts.service';

export const contractUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowed.includes(file.mimetype));
  },
});

export async function listContracts(req: Request, res: Response, next: NextFunction) {
  try {
    const contracts = await ContractsService.listContracts(req.user!.tenantId, req.params.contactId);
    res.json({ data: contracts });
  } catch (err) { next(err); }
}

export async function uploadContract(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) { res.status(400).json({ error: 'File required (PDF, DOC ou DOCX, máx 10MB)' }); return; }
    const contract = await ContractsService.uploadContract(req.user!.tenantId, req.params.contactId, req.file);
    res.status(201).json({ data: contract });
  } catch (err) { next(err); }
}

export async function downloadContract(req: Request, res: Response, next: NextFunction) {
  try {
    const contract = await ContractsService.downloadContract(req.user!.tenantId, req.params.contractId);
    res.setHeader('Content-Type', contract.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${contract.original_name}"`);
    res.send(contract.file_data);
  } catch (err) { next(err); }
}

export async function deleteContract(req: Request, res: Response, next: NextFunction) {
  try {
    await ContractsService.deleteContract(req.user!.tenantId, req.params.contractId);
    res.status(204).send();
  } catch (err) { next(err); }
}
