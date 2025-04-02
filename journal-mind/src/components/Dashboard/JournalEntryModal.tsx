import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/UI/dialog";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { Textarea } from "@/components/UI/textarea";
import { X } from "lucide-react";
import { useState } from "react";

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JournalEntryModal({ isOpen, onClose }: JournalEntryModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  }));

  const moods = [
    "excited",
    "peaceful",
    "accomplished",
    "reflective",
    "anxious"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Journal Entry</DialogTitle>
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium">
                Time
              </label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
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
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="mood" className="text-sm font-medium">
              Mood
            </label>
            <Select>
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button>
            Save Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
