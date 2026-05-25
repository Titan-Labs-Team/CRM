import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { contactsService } from '@/services/contacts.service';
import { useUploadContactPhoto, useDeleteContactPhoto } from '@/hooks/useContacts';
import { Spinner } from '@/components/ui/Spinner';

interface ContactPhotoUploadProps {
  contactId: string;
  hasPhoto: boolean;
  onPhotoChange?: () => void;
}

export function ContactPhotoUpload({ contactId, hasPhoto, onPhotoChange }: ContactPhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const uploadPhoto = useUploadContactPhoto();
  const deletePhoto = useDeleteContactPhoto();

  const photoUrl = contactsService.photoUrl(contactId);
  const displayUrl = preview ?? (hasPhoto ? `${photoUrl}?t=${Date.now()}` : null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    try {
      await uploadPhoto.mutateAsync({ id: contactId, file });
      setPreview(null);
      onPhotoChange?.();
    } catch {
      setPreview(null);
    } finally {
      e.target.value = '';
    }
  }

  async function handleDelete() {
    await deletePhoto.mutateAsync(contactId);
    setPreview(null);
    onPhotoChange?.();
  }

  const isLoading = uploadPhoto.isPending || deletePhoto.isPending;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-secondary">Foto do cliente</label>
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 flex-shrink-0">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Foto"
              className="w-16 h-16 rounded-full object-cover border-2 border-bg-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-bg-border flex items-center justify-center">
              <Camera size={20} className="text-text-muted" />
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 rounded-full bg-bg-darker/70 flex items-center justify-center">
              <Spinner />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-lg border border-bg-border text-text-secondary hover:text-text-primary hover:border-accent-green/40 transition-colors disabled:opacity-50"
          >
            {displayUrl ? 'Trocar foto' : 'Carregar foto'}
          </button>
          {(hasPhoto || preview) && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-xs flex items-center gap-1 text-text-muted hover:text-status-lost transition-colors disabled:opacity-50"
            >
              <Trash2 size={11} /> Remover
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
