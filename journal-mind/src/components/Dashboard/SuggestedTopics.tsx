import { LifeBuoy, Heart, Award, PenTool } from "lucide-react";

const topics = [
  { name: "Personal Growth", icon: LifeBuoy },
  { name: "Gratitude", icon: Heart },
  { name: "Achievements", icon: Award },
  { name: "Creative Writing", icon: PenTool },
];

export default function SuggestedTopics() {
  return (
    <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
      <h2 className="text-lg font-semibold mb-4">Suggested Topics</h2>
      
      <div className="space-y-3">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <button 
              key={topic.name}
              className="flex items-center gap-3 w-full p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Icon size={16} className="text-primary" />
              <span>{topic.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}