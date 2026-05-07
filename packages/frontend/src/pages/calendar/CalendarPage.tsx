import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateClickArg } from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import { useCalendarEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useCalendar';
import { EventModal } from '@/components/calendar/EventModal';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import type { CalendarEvent, CreateEventInput } from '@/services/calendar.service';

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CalendarPage() {
  const { data: events, isLoading } = useCalendarEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [defaultStart, setDefaultStart] = useState('');

  const fcEvents = (events ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start_at,
    end: e.end_at,
    allDay: e.all_day,
    backgroundColor: '#72d296',
    borderColor: '#4a9b6f',
    textColor: '#04080f',
    extendedProps: { raw: e },
  }));

  const handleDateClick = (arg: DateClickArg) => {
    const start = new Date(arg.date);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setDefaultStart(toLocalInput(start));
    setSelectedEvent(null);
    setModalOpen(true);
    arg.jsEvent.preventDefault();
    // prefill end to start+1h
    (window as unknown as { __calendarDefaultEnd?: string }).__calendarDefaultEnd = toLocalInput(end);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const raw = arg.event.extendedProps.raw as CalendarEvent;
    setSelectedEvent(raw);
    setDefaultStart('');
    setModalOpen(true);
  };

  const handleSubmit = async (data: CreateEventInput) => {
    if (selectedEvent) {
      await updateEvent.mutateAsync({ id: selectedEvent.id, input: data });
    } else {
      await createEvent.mutateAsync(data);
    }
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    await deleteEvent.mutateAsync(selectedEvent.id);
    setModalOpen(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-24"><Spinner /></div>;
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-semibold text-text-primary">Calendário</h1>
      </div>

      <div className="card p-4 flex-1 min-h-0 overflow-hidden fullcalendar-dark">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="pt-br"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
          }}
          events={fcEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="100%"
          editable={false}
          selectable={true}
          dayMaxEvents={3}
          nowIndicator={true}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEvent(null); }}
        title={selectedEvent ? 'Editar evento' : 'Novo evento'}
      >
        <EventModal
          event={selectedEvent}
          defaultStart={defaultStart}
          onSubmit={handleSubmit}
          onDelete={selectedEvent ? handleDelete : undefined}
          onCancel={() => { setModalOpen(false); setSelectedEvent(null); }}
          isSubmitting={createEvent.isPending || updateEvent.isPending || deleteEvent.isPending}
        />
      </Modal>
    </div>
  );
}
