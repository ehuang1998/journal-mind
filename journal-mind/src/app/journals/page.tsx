"use client";
import { useState } from "react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Search, Plus } from "lucide-react";
import JournalEntryModal from "@/components/Dashboard/JournalEntryModal";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";

export default function JournalsPage() {
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 4;

  // Sample data - replace with actual data fetching
  const entries = [
    {
      id: 1,
      title: "Morning Reflections on Personal Growth",
      excerpt: "Today I spent some time reflecting on my journey of personal development. The morning meditation session was particularly insightful, helping me understand my goals better.",
      dateTime: "2025-03-11 • 08:30 AM",
      mood: "reflective"
    },
    {
      id: 2,
      title: "Creative Writing Workshop Experience",
      excerpt: "Attended an amazing creative writing workshop today. The instructor shared valuable techniques for character development and plot structure.",
      dateTime: "2025-03-10 • 02:15 PM",
      mood: "excited"
    },
    {
      id: 3,
      title: "Weekend Nature Walk Observations",
      excerpt: "Took a peaceful walk in Central Park. The spring flowers are starting to bloom, and the air was crisp and refreshing.",
      dateTime: "2025-03-09 • 10:45 AM",
      mood: "peaceful"
    },
    {
      id: 4,
      title: "Project Milestone Achievement",
      excerpt: "Successfully completed the first phase of our major project. The team's dedication and collaboration made this possible.",
      dateTime: "2025-03-08 • 04:20 PM",
      mood: "accomplished"
    },
    {
      id: 5,
      title: "Evening Meditation Insights",
      excerpt: "Tonight's meditation session brought unexpected clarity about recent challenges. Sometimes answers come when we least expect them.",
      dateTime: "2025-03-07 • 09:15 PM",
      mood: "peaceful"
    },
    {
      id: 6,
      title: "Team Collaboration Success",
      excerpt: "Today's brainstorming session was incredibly productive. Everyone brought unique perspectives that enhanced our solution.",
      dateTime: "2025-03-06 • 03:30 PM",
      mood: "excited"
    }
  ];

  // Calculate pagination
  const totalPages = Math.ceil(entries.length / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = entries.slice(indexOfFirstEntry, indexOfLastEntry);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Journals</h1>
          <Button onClick={() => setIsNewEntryModalOpen(true)}>
            <Plus size={16} className="mr-1.5" />
            New Entry
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search journals..." 
            className="pl-10 w-full max-w-md"
          />
        </div>

        {/* Journal Entries */}
        <div className="space-y-4">
          {currentEntries.map((entry) => (
            <div 
              key={entry.id}
              className="bg-card rounded-lg p-6 border border-border/40 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{entry.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{entry.dateTime}</p>
                  <p className="text-muted-foreground">{entry.excerpt}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </main>

      <JournalEntryModal
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
      />
    </div>
  );
}