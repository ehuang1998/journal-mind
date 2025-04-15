import { Edit, Bookmark } from "lucide-react";
import { useState } from "react";
import JournalEntryModal from "@/components/Dashboard/JournalEntryModal";

interface JournalCardProps {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  dateTime: string;
  mood: string;
  recommendation?: string;
  isPinned?: boolean;
  onEditSuccess?: () => void;
}

function formatJournalDate(isoDate: string): string {
  const date = new Date(isoDate);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  let hours = date.getHours();
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const time = `${hours}:${minutes} ${ampm}`;

  return `${year}-${month}-${day} at ${time}`;
}


export default function JournalCard({
  id,
  title,
  excerpt,
  content,
  dateTime,
  mood,
  recommendation,
  isPinned = false,
  onEditSuccess
}: JournalCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Map moods to color schemes
  const moodColors: Record<string, { bg: string, text: string }> = {
    excited: { 
      bg: "bg-amber-100 dark:bg-amber-900", 
      text: "text-amber-800 dark:text-amber-100" 
    },
    peaceful: { 
      bg: "bg-blue-100 dark:bg-blue-900", 
      text: "text-blue-800 dark:text-blue-100" 
    },
    accomplished: { 
      bg: "bg-green-100 dark:bg-green-900", 
      text: "text-green-800 dark:text-green-100" 
    },
    reflective: { 
      bg: "bg-purple-100 dark:bg-purple-900", 
      text: "text-purple-800 dark:text-purple-100" 
    },
    anxious: { 
      bg: "bg-red-100 dark:bg-red-900", 
      text: "text-red-800 dark:text-red-100" 
    }
  };

  const moodStyle = moodColors[mood] || { 
    bg: "bg-gray-100 dark:bg-gray-800", 
    text: "text-gray-800 dark:text-gray-100" 
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    // Call the parent's success handler if provided
    if (onEditSuccess) {
      onEditSuccess();
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium">{title}</h3>
          <div className="flex space-x-2">
            <button 
              className="text-muted-foreground hover:text-foreground"
              onClick={handleEditClick}
            >
              <Edit size={18} />
            </button>
            {/* <button className="text-muted-foreground hover:text-foreground">
              <Bookmark size={18} className={isPinned ? "text-red-500" : ""} />
            </button> */}
          </div>
        </div>
        
        <p className="text-muted-foreground mb-3 line-clamp-2">{excerpt}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {formatJournalDate(dateTime)}
          </div>
          <span className={`px-2.5 py-0.5 ${moodStyle.bg} ${moodStyle.text} text-xs rounded-full`}>
            {mood}
          </span>
        </div>
      </div>

      {/* Journal Edit Modal */}
      <JournalEntryModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleEditSuccess}
        journal={{
          id,
          title,
          content,
          emotion: mood,
          recommendation,
          createdAt: dateTime
        }}
        isEditing={true}
      />
    </>
  );
}