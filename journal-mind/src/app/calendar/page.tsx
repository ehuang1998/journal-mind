'use client';

import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import { moodColors } from '@/lib/constants';
import JournalEntryModal from '@/components/Dashboard/JournalEntryModal';
import { Button } from '@/components/UI/button';
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/UI/dialog";

type JournalEntry = {
    id: string;
    createdAt: string;
    title: string;
    content: string;
    emotion: string;
    recommendation?: string;
};

export default function CalendarPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayJournals, setDayJournals] = useState<JournalEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [journalToEdit, setJournalToEdit] = useState<JournalEntry | null>(null);
  const [journalToDelete, setJournalToDelete] = useState<JournalEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const router = useRouter();

  const formatDateToKey = (date: Date) => date.toISOString().split('T')[0];

  useEffect(() => {
    fetch('/api/journals')
      .then(res => res.json())
      .then((data: JournalEntry[]) => {
        setEntries(data);
        const dates = new Set(
          data.map(entry => formatDateToKey(new Date(entry.createdAt)))
        );
        setHighlightedDates(dates);
      });
  }, []);

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && highlightedDates.has(formatDateToKey(date))) {
      return 'highlighted-date';
    }
    return '';
  };

  const handleDateClick = (date: Date) => {
    const key = formatDateToKey(date);
    const journalsForThatDay = entries.filter(
      entry => formatDateToKey(new Date(entry.createdAt)) === key
    );
  
    if (journalsForThatDay.length > 0) {
      setSelectedDate(key);
      setDayJournals(journalsForThatDay);
      setIsModalOpen(true);
    }
  };

  const handleEditClick = (journal: JournalEntry) => {
    setJournalToEdit(journal);
    setEditModalOpen(true);
  };
  
  const handleDeleteClick = (journal: JournalEntry) => {
    setJournalToDelete(journal);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!journalToDelete) return;
  
    try {
      const response = await fetch(`/api/journals/${journalToDelete.id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete journal');
      }
  
      // Refresh modal entries
      const key = formatDateToKey(new Date(journalToDelete.createdAt));
      const updatedEntries = entries.filter(entry => entry.id !== journalToDelete.id);
      setEntries(updatedEntries);
      setDayJournals(updatedEntries.filter(e => formatDateToKey(new Date(e.createdAt)) === key));
      setDeleteDialogOpen(false);
      setJournalToDelete(null);
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-6 py-10">
        <div className="mb-8">
            <button
                onClick={() => router.push('/journals')}
                className="flex items-center text-sm font-medium text-primary hover:underline">
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
            </button>
            <h1 className="text-3xl font-bold">Journal Calendar</h1>
        </div>
        <div className="w-full mx-auto bg-white dark:bg-muted rounded-xl shadow-lg p-6">
        <Calendar
            tileClassName={tileClassName}
            tileContent={({ date, view }) => {
                if (view !== 'month') return null;
                
                const key = formatDateToKey(date);
                const isHighlighted = highlightedDates.has(key);
                const dayEntries = entries.filter(
                    entry => formatDateToKey(new Date(entry.createdAt)) === key
                );
                
                const uniqueEmotions = [...new Set(dayEntries.map(entry => entry.emotion))];
                
                return (
                    <div className={`w-full h-full p-1 rounded-md ${ isHighlighted ? 'ring-2 ring-blue-400 bg-white' : ''}`}>
                    {/* Journal titles */}
                    <div className="space-y-0.5">
                        {dayEntries.slice(0, 2).map(entry => (
                        <p
                            key={entry.id}
                            className="text-[10px] leading-tight text-blue-900 dark:text-blue-100 truncate"
                        >
                            • {entry.title}
                        </p>
                        ))}
                        {dayEntries.length > 2 && (
                        <p className="text-[10px] text-muted-foreground">
                            +{dayEntries.length - 2} more
                        </p>
                        )}
                    </div>
                
                    {/* Emotion bars */}
                    <div className="w-full flex rounded overflow-hidden h-[6px] mt-1">
                        {uniqueEmotions.map((emotion) => {
                        const color = moodColors[emotion]?.bg || "bg-gray-300";
                        return (
                            <div
                            key={emotion}
                            className={`${color} h-full`}
                            style={{ width: `${100 / uniqueEmotions.length}%` }}
                            />
                        );
                        })}
                    </div>
                    </div>
                );
                }}
            onClickDay={handleDateClick}
            className="w-full text-sm sm:text-base"
        />
        </div>
      </div>

      {/* Custom styles for date highlighting */}
      <style jsx global>{`
        .react-calendar {
          border: none;
          width: 100%;
        }

        .react-calendar__tile {
          padding: 0.75rem 0.5rem;
          border-radius: 0.375rem;
        }

        .highlighted-date {
          background-color:rgb(255, 255, 255);
          color: #1e3a8a;
          border-radius: 9999px;
          font-weight: 600;
        }

        .react-calendar__tile--now {
          background: transparent !important;
          border: 2px solid #60a5fa; 
          color: inherit;
        }

        .react-calendar__tile:enabled:hover {
          background: #e0f2fe !important; 
        }

        .react-calendar__navigation__label {
          font-size: 1.25rem; /* text-lg */
          font-weight: 600;   /* semi-bold */
        }
      `}</style>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Journals for {selectedDate}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {dayJournals.map(journal => {
                const moodStyle = moodColors[journal.emotion] || {
                bg: "bg-gray-100 dark:bg-gray-800",
                text: "text-gray-800 dark:text-gray-100"
                };

                return (
                    <div
                    key={journal.id}
                    className="bg-card rounded-lg p-4 border border-border/40 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold">{journal.title}</h2>
                        <p className={`text-xs mt-1 px-2 py-0.5 inline-block rounded-full ${moodStyle.bg} ${moodStyle.text}`}>
                          {journal.emotion}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(journal)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleDeleteClick(journal)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{journal.content}</p>
                    {journal.recommendation && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <h3 className="text-xs font-medium">AI Insight:</h3>
                        <p className="text-sm">{journal.recommendation}</p>
                      </div>
                    )}
                  </div>
                );
            })}
            </div>

            <DialogFooter className="pt-4">
            <button className="text-sm underline" onClick={() => setIsModalOpen(false)}>
                Close
            </button>
            </DialogFooter>
        </DialogContent>
        </Dialog>

        <JournalEntryModal
            isOpen={editModalOpen}
            onClose={() => {
                setEditModalOpen(false);
                setJournalToEdit(null);
            }}
            onSuccess={() => {
                const key = selectedDate;
                fetch('/api/journals')
                .then(res => res.json())
                .then((data: JournalEntry[]) => {
                    setEntries(data);
                    setDayJournals(data.filter(entry => formatDateToKey(new Date(entry.createdAt)) === key));
                });
            }}
            journal={journalToEdit}
            isEditing={true}
        />

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
            <p className="text-sm">
                Are you sure you want to delete "{journalToDelete?.title}"? This action cannot be undone.
            </p>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    </div>
  );
}
