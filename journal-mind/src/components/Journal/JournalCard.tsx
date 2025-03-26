import { Edit, Bookmark } from "lucide-react";

interface JournalCardProps {
  title: string;
  excerpt: string;
  dateTime: string;
  mood: string;
  isPinned?: boolean;
}

export default function JournalCard({
  title,
  excerpt,
  dateTime,
  mood,
  isPinned = false
}: JournalCardProps) {
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

  return (
    <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex space-x-2">
          <button className="text-muted-foreground hover:text-foreground">
            <Edit size={18} />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <Bookmark size={18} className={isPinned ? "text-red-500" : ""} />
          </button>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-3 line-clamp-2">{excerpt}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {dateTime}
        </div>
        <span className={`px-2.5 py-0.5 ${moodStyle.bg} ${moodStyle.text} text-xs rounded-full`}>
          {mood}
        </span>
      </div>
    </div>
  );
}