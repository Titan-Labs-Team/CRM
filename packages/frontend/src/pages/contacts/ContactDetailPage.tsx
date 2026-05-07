import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Mail, Phone, Building2, Briefcase, Globe } from 'lucide-react';
import { useContact, useUpdateContact } from '@/hooks/useContacts';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { ContactForm } from '@/components/contacts/ContactForm';
import { useState } from 'react';

const typeBadgeVariant: Record<string, 'green' | 'blue' | 'default'> = {
  lead: 'blue',
  contact: 'default',
  client: 'green',
};

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading } = useContact(id!);
  const updateContact = useUpdateContact();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-24 text-text-muted">Contact not found.</div>
    );
  }

  const handleUpdate = async (formData: Parameters<typeof updateContact.mutateAsync>[0]['input']) => {
    await updateContact.mutateAsync({ id: contact.id, input: formData });
    setEditOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/contacts')}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-text-primary flex-1">{contact.full_name}</h1>
        <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil size={13} /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — profile */}
        <div className="card p-5 space-y-5">
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar name={contact.full_name} size="lg" />
            <div>
              <p className="font-semibold text-text-primary">{contact.full_name}</p>
              {contact.job_title && (
                <p className="text-sm text-text-secondary">{contact.job_title}</p>
              )}
              <Badge variant={typeBadgeVariant[contact.type] ?? 'default'} className="mt-2">
                {contact.type}
              </Badge>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {contact.email && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Mail size={14} className="flex-shrink-0 text-text-muted" />
                <a href={`mailto:${contact.email}`} className="hover:text-accent-green truncate">
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Phone size={14} className="flex-shrink-0 text-text-muted" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.company_name && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Building2 size={14} className="flex-shrink-0 text-text-muted" />
                <span>{contact.company_name}</span>
              </div>
            )}
            {contact.job_title && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Briefcase size={14} className="flex-shrink-0 text-text-muted" />
                <span>{contact.job_title}</span>
              </div>
            )}
            {contact.source && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Globe size={14} className="flex-shrink-0 text-text-muted" />
                <span className="capitalize">{contact.source}</span>
              </div>
            )}
          </div>

          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {contact.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-bg-border text-xs text-text-muted space-y-1">
            <p>Owner: {contact.owner_name ?? '—'}</p>
            <p>Added: {new Date(contact.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Right — deals & activity placeholder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <p className="text-sm font-medium text-text-primary mb-3">Deals</p>
            <p className="text-sm text-text-muted">Deals will appear here in Milestone 3.</p>
          </div>
          <div className="card p-5">
            <p className="text-sm font-medium text-text-primary mb-3">Activity</p>
            <p className="text-sm text-text-muted">Activity timeline coming in Milestone 4.</p>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit contact">
        <ContactForm
          defaultValues={contact}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          isSubmitting={updateContact.isPending}
        />
      </Modal>
    </div>
  );
}
