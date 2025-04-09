import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/UI/dialog";
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

  const moods = [
    "excited",
    "peaceful",
    "accomplished",
    "reflective",
    "anxious"
  ];

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

  const handleSubmit = async () => {
    setErrors({ title: '', content: '', emotion: '' }); // Reset errors
    let hasError = false;

    if (!formData.title) {
      setErrors(prev => ({ ...prev, title: 'Title is required' }));
      hasError = true;
    }
    if (!formData.content) {
      setErrors(prev => ({ ...prev, content: 'Content is required' }));
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
        const error = await response.json();
        throw new Error(error.message || `Failed to ${isEditing ? 'update' : 'create'} journal entry`);
      }

      // Reset form and close modal
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
      onClose();
      onSuccess?.();

    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} journal:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Edit Journal Entry' : 'Create New Journal Entry'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter your entry title..."
              className="w-full"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              placeholder="Write your thoughts..."
              className="min-h-[200px]"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            />
            {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="mood" className="text-sm font-medium">
              Mood
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
  );
}
