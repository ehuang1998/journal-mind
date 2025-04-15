import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/UI/dialog";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { Textarea } from "@/components/UI/textarea";
import { useState, useEffect } from "react";

interface Journal {
  id?: string;
  title: string;
  content: string;
  emotion: string;
  recommendation?: string;
  createdAt?: string;
}

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  journal?: Journal | null;
  isEditing?: boolean;
}

export default function JournalEntryModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  journal = null, 
  isEditing = false 
}: JournalEntryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    emotion: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  });
  
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    emotion: '',
  });

  const [wordCounts, setWordCounts] = useState({
    title: 0,
    content: 0
  });

  // New state for recommendation popup
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState('');

  const TITLE_WORD_LIMIT = 10;
  const CONTENT_WORD_LIMIT = 300;

  const moods = [
    "excited",
    "peaceful",
    "accomplished",
    "reflective",
    "anxious"
  ];

  // Update word counts when form data changes
  useEffect(() => {
    const titleWords = formData.title.trim() ? formData.title.trim().split(/\s+/).length : 0;
    const contentWords = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
    
    setWordCounts({
      title: titleWords,
      content: contentWords
    });
  }, [formData.title, formData.content]);

  // Populate form data if editing an existing journal
  useEffect(() => {
    if (journal && isEditing) {
      const createdAt = journal.createdAt ? new Date(journal.createdAt) : new Date();
      
      setFormData({
        title: journal.title || '',
        content: journal.content || '',
        emotion: journal.emotion || '',
        date: createdAt.toISOString().split('T')[0],
        time: createdAt.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      });
    } else {
      // Reset form when opening for a new entry
      setFormData({
        title: '',
        content: '',
        emotion: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      });
      setErrors({ title: '', content: '', emotion: '' }); // Reset errors
    }
  }, [journal, isEditing, isOpen]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const words = newTitle.trim().split(/\s+/);
    
    if (words.length <= TITLE_WORD_LIMIT || words.length === 1 && words[0] === '') {
      setFormData(prev => ({ ...prev, title: newTitle }));
      setErrors(prev => ({ ...prev, title: '' }));
    } else {
      setErrors(prev => ({ ...prev, title: `Title cannot exceed ${TITLE_WORD_LIMIT} words` }));
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const words = newContent.trim().split(/\s+/);
    
    if (words.length <= CONTENT_WORD_LIMIT || words.length === 1 && words[0] === '') {
      setFormData(prev => ({ ...prev, content: newContent }));
      setErrors(prev => ({ ...prev, content: '' }));
    } else {
      setErrors(prev => ({ ...prev, content: `Content cannot exceed ${CONTENT_WORD_LIMIT} words` }));
    }
  };

  const handleCloseRecommendation = () => {
    setShowRecommendation(false);
    onClose();
    onSuccess?.();
  };

  const handleSubmit = async () => {
    setErrors({ title: '', content: '', emotion: '' }); // Reset errors
    let hasError = false;

    // Validate fields
    if (!formData.title.trim()) {
      setErrors(prev => ({ ...prev, title: 'Title is required' }));
      hasError = true;
    } else if (wordCounts.title > TITLE_WORD_LIMIT) {
      setErrors(prev => ({ ...prev, title: `Title cannot exceed ${TITLE_WORD_LIMIT} words` }));
      hasError = true;
    }

    if (!formData.content.trim()) {
      setErrors(prev => ({ ...prev, content: 'Content is required' }));
      hasError = true;
    } else if (wordCounts.content > CONTENT_WORD_LIMIT) {
      setErrors(prev => ({ ...prev, content: `Content cannot exceed ${CONTENT_WORD_LIMIT} words` }));
      hasError = true;
    }

    if (!formData.emotion) {
      setErrors(prev => ({ ...prev, emotion: 'Mood is required' }));
      hasError = true;
    }

    if (hasError) return; // Stop submission if there are errors

    try {
      setIsSubmitting(true);

      const url = isEditing && journal?.id 
        ? `/api/journals/${journal.id}` 
        : '/api/journals';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          emotion: formData.emotion,
        }),
      });

      if (!response.ok) {
        // Read error message from response body
        let errorMessage = `Failed to ${isEditing ? 'update' : 'create'} journal entry`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch { // Remove variable name entirely
          // Ignore parsing error, stick with default message
        }
        throw new Error(errorMessage);
      }

      // Parse the response to get the recommendation
      const data = await response.json();
      
      // Set recommendation and show the popup
      if (data.recommendation) {
        setRecommendation(data.recommendation);
        setShowRecommendation(true);
      } else {
        // If no recommendation, just close the form
        handleCloseRecommendation();
      }

      // Reset form (moved from finally block, only reset on success)
      setFormData({
        title: '',
        content: '',
        emotion: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      });

    } catch (error: unknown) { // Add unknown type
      let errorMessage = `Error ${isEditing ? 'updating' : 'creating'} journal`;
      if (error instanceof Error) {
        errorMessage = error.message; // Use message from thrown error
      }
      console.error(errorMessage, error); // Log the actual error object too
      // TODO: Maybe show error message to the user?
      // Close the modal in case of error
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showRecommendation} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[1000px] max-h-[100vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? 'Edit Journal Entry' : 'Create New Journal Entry'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <span className={`text-xs ${wordCounts.title > TITLE_WORD_LIMIT ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {wordCounts.title}/{TITLE_WORD_LIMIT} words
                </span>
              </div>
              <Input
                id="title"
                placeholder="Enter your entry title..."
                className="w-full"
                value={formData.title}
                onChange={handleTitleChange}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium">
                  Time
                </label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <span className={`text-xs ${wordCounts.content > CONTENT_WORD_LIMIT ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {wordCounts.content}/{CONTENT_WORD_LIMIT} words
                </span>
              </div>
              <Textarea
                id="content"
                placeholder="Write your thoughts..."
                className="min-h-[200px]"
                value={formData.content}
                onChange={handleContentChange}
              />
              {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="mood" className="text-sm font-medium">
                How are you feeling right now?
              </label>
              <Select
                value={formData.emotion}
                onValueChange={(value) => setFormData(prev => ({ ...prev, emotion: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem key={mood} value={mood}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.emotion && <p className="text-red-500 text-sm">{errors.emotion}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium">
                Tags (comma separated)
              </label>
              <Input
                id="tags"
                placeholder="happiness, reflection, goals..."
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Entry' : 'Save Entry')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Recommendation Popup */}
      <Dialog open={showRecommendation} onOpenChange={handleCloseRecommendation}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              AI Generated Insights
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-muted-foreground">{recommendation}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleCloseRecommendation}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
