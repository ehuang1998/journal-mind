"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { CalendarDays, Search, Plus } from "lucide-react";
import JournalEntryModal from "@/components/Dashboard/JournalEntryModal";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { moodColors } from '@/lib/constants';
import Link from "next/link";
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/UI/dialog";

interface Journal {
  id: string;
  title: string;
  content: string;
  emotion: string;
  recommendation?: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 4; // Number of journals to show per page

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState<Journal | null>(null);
  const [journalToEdit, setJournalToEdit] = useState<Journal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  // Fetch journals
  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const response = await fetch('/api/journals');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch journals');
      }
      const data = await response.json();
      setJournals(data);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter journals based on search query
  const filteredJournals = journals.filter(journal =>
    journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredJournals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentJournals = filteredJournals.slice(startIndex, endIndex);

  // Format date to match the design
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleJournalCreated = () => {
    fetchJournals();
  };

  const handleEditClick = (journal: Journal) => {
    setJournalToEdit(journal);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (journal: Journal) => {
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

      // Close the dialog
      setDeleteDialogOpen(false);
      setJournalToDelete(null);

      // Refresh the journals list
      fetchJournals();
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  const handleDownloadPDF = async (journal: Journal) => {
    const pdf = new jsPDF();
    const content = `
      Title: ${journal.title}
      Date: ${new Date(journal.createdAt).toLocaleString()}
      Mood: ${journal.emotion}
      
      Content:
      ${journal.content}
      
      ${journal.recommendation ? `\nRecommendation:\n${journal.recommendation}` : ''}
    `;

    pdf.setFontSize(12);
    pdf.text(content, 10, 10, { maxWidth: 180 });
    pdf.save(`${journal.title.replace(/\s+/g, "_")}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Journals</h1>
          <div className="flex gap-2">
            <Link href="/calendar">
              <Button variant="outline">
                <CalendarDays size={16} className="mr-1.5" />
                View Calendar
              </Button>
            </Link>
            <Button onClick={() => setIsNewEntryModalOpen(true)}>
              <Plus size={16} className="mr-1.5" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search journals..." 
            className="pl-10 w-full max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Journal Entries */}
        <div className="space-y-4">
          {currentJournals.map((journal) => {
            const moodStyle = moodColors[journal.emotion] || { 
              bg: "bg-gray-100 dark:bg-gray-800", 
              text: "text-gray-800 dark:text-gray-100" 
            };
            
            return (
              <div 
                key={journal.id}
                className="bg-card rounded-lg p-6 border border-border/40 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col">
                  <div className="flex justify-between items-start w-full mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold">{journal.title}</h2>
                        <span className={`px-2.5 py-0.5 ${moodStyle.bg} ${moodStyle.text} text-xs rounded-full`}>
                          {journal.emotion}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(journal.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(journal)}
                      >
                        Download
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(journal)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive" 
                        onClick={() => handleDeleteClick(journal)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{journal.content}</p>
                  
                  {journal.recommendation && (
                    <div className="mt-2 p-4 bg-muted rounded-md w-full">
                      <h3 className="text-sm font-medium mb-1">AI Generated Insights:</h3>
                      <p className="text-sm text-muted-foreground">{journal.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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

      {/* Create Journal Modal */}
      <JournalEntryModal
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
        onSuccess={handleJournalCreated}
      />

      {/* Edit Journal Modal */}
      <JournalEntryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setJournalToEdit(null);
        }}
        onSuccess={handleJournalCreated}
        journal={journalToEdit}
        isEditing={true}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{journalToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}