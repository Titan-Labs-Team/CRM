import { useRef } from 'react';
import { FileText, Upload, Trash2, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useContracts, useUploadContract, useDeleteContract } from '@/hooks/useContracts';
import { contractsService } from '@/services/contracts.service';
import { useAuthStore } from '@/store/authStore';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  contactId: string;
}

export function ContractSection({ contactId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: contracts = [], isLoading } = useContracts(contactId);
  const upload = useUploadContract(contactId);
  const remove = useDeleteContract(contactId);
  const token = useAuthStore((s) => s.accessToken);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    upload.mutate(file);
    e.target.value = '';
  }

  function handleDownload(contractId: string, originalName: string) {
    const url = contractsService.downloadUrl(contactId, contractId);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    // Pass auth token via URL is not ideal — use fetch + blob instead
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.download = originalName;
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-accent-green" />
          <h3 className="font-medium text-sm text-text-primary">Contratos</h3>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
          className="flex items-center gap-1.5 text-xs text-accent-green hover:text-accent-green-dim transition-colors disabled:opacity-50"
        >
          {upload.isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Upload size={13} />
          )}
          {upload.isPending ? 'Enviando…' : 'Enviar contrato'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={16} className="animate-spin text-text-muted" />
        </div>
      ) : contracts.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border border-dashed border-bg-border rounded-xl py-6 flex flex-col items-center gap-2 text-text-muted cursor-pointer hover:border-accent-green hover:text-accent-green transition-colors"
        >
          <Upload size={20} />
          <p className="text-xs">Clique para enviar o contrato</p>
          <p className="text-xs opacity-60">PDF, DOC ou DOCX — máx. 10MB</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {contracts.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-bg-border bg-bg-primary hover:border-accent-green/40 transition-colors"
            >
              <FileText size={18} className="text-accent-green shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{c.original_name}</p>
                <p className="text-xs text-text-muted">
                  {formatBytes(c.file_size)} · {format(new Date(c.uploaded_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleDownload(c.id, c.original_name)}
                  className="p-1.5 rounded text-text-muted hover:text-accent-green hover:bg-accent-green/10 transition-colors"
                  title="Baixar"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remover "${c.original_name}"?`)) remove.mutate(c.id);
                  }}
                  className="p-1.5 rounded text-text-muted hover:text-status-lost hover:bg-status-lost/10 transition-colors"
                  title="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
