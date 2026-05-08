import { useState } from 'react';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { useCreateStage, useDeleteStage } from '@/hooks/usePipeline';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { StageWithDeals } from '@/services/pipeline.service';
import { toast } from 'sonner';

const STAGE_COLORS = [
  '#6366f1', // índigo
  '#f59e0b', // âmbar
  '#3b82f6', // azul
  '#10b981', // verde
  '#ef4444', // vermelho
  '#8b5cf6', // roxo
  '#ec4899', // rosa
  '#14b8a6', // teal
];

interface PipelineSettingsModalProps {
  open: boolean;
  onClose: () => void;
  pipelineId: string;
  pipelineName: string;
  stages: StageWithDeals[];
}

export function PipelineSettingsModal({
  open,
  onClose,
  pipelineId,
  pipelineName,
  stages,
}: PipelineSettingsModalProps) {
  const [newStageName, setNewStageName] = useState('');
  const [selectedColor, setSelectedColor] = useState(STAGE_COLORS[0]);

  const createStage = useCreateStage();
  const deleteStage = useDeleteStage();

  const handleAddStage = async () => {
    const name = newStageName.trim();
    if (!name) return;
    await createStage.mutateAsync({ pipelineId, input: { name, color: selectedColor } });
    setNewStageName('');
    setSelectedColor(STAGE_COLORS[0]);
  };

  const handleDelete = async (stageId: string, dealCount: number) => {
    if (dealCount > 0) {
      toast.error(`Esta etapa tem ${dealCount} negócio(s). Mova-os antes de excluir.`);
      return;
    }
    await deleteStage.mutateAsync({ pipelineId, stageId });
  };

  return (
    <Modal open={open} onClose={onClose} title={`Etapas — ${pipelineName}`}>
      <div className="space-y-5">
        {/* Existing stages */}
        {stages.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">
            Nenhuma etapa ainda. Adicione a primeira abaixo.
          </p>
        ) : (
          <div className="space-y-1">
            {stages.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-surface border border-bg-border"
              >
                <GripVertical size={14} className="text-text-muted flex-shrink-0" />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color || '#6366f1' }}
                />
                <span className="text-text-primary text-sm flex-1">{s.name}</span>
                {s.deals.length > 0 && (
                  <span className="text-xs text-text-muted">
                    {s.deals.length} negócio{s.deals.length !== 1 ? 's' : ''}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(s.id, s.deals.length)}
                  className="p-1 rounded text-text-muted hover:text-status-lost hover:bg-status-lost/10 transition-colors"
                  title="Remover etapa"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add stage form */}
        <div className="border-t border-bg-border pt-4 space-y-3">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Nova etapa
          </p>
          <Input
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            placeholder="Ex: Qualificação"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStage(); } }}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Cor:</span>
            {STAGE_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  selectedColor === color ? 'ring-2 ring-white ring-offset-1 ring-offset-bg-surface scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <Button
            onClick={handleAddStage}
            disabled={!newStageName.trim() || createStage.isPending}
            size="sm"
            className="w-full"
          >
            <Plus size={14} />
            {createStage.isPending ? 'Adicionando…' : 'Adicionar etapa'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
