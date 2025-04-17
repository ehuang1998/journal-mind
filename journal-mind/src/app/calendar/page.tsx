'use client';

import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import { moodColors } from '@/lib/constants';

type JournalEntry = {
  id: string;
  createdAt: string;
};

export default function CalendarPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<Set<string>>(new Set());

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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Journal Calendar</h1>
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
      `}</style>
    </div>
  );
}
