  // Map moods to color schemes
export const moodColors: Record<string, { bg: string; text: string }> = {
    excited: {
      bg: "bg-amber-100 dark:bg-amber-900",
      text: "text-amber-800 dark:text-amber-100",
    },
    peaceful: {
      bg: "bg-blue-100 dark:bg-blue-900",
      text: "text-blue-800 dark:text-blue-100",
    },
    accomplished: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-800 dark:text-green-100",
    },
    reflective: {
      bg: "bg-purple-100 dark:bg-purple-900",
      text: "text-purple-800 dark:text-purple-100",
    },
    anxious: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-800 dark:text-red-100",
    }
  };

  export const journalingTips = [
    "Reflect on one small win from today.",
    "You don't need the perfect words — just start.",
    "Journaling is self-care, not a task.",
    "Your feelings are valid, even if they don't make sense yet.",
    "A short entry is better than none at all.",
    "Try writing a letter to your future self.",
    "Progress is progress, even if it's slow.",
    "Describe a moment that made you smile today.",
    "What you write here is for you — no one else.",
    "Name one thing you're grateful for today.",
    "It's okay if today felt hard. You showed up.",
    "Celebrate something you usually overlook.",
    "Journaling doesn't need rules — make it yours.",
    "Let go of needing to 'write well'. Just write.",
    "Today's feelings are not forever.",
    "List 3 things you like about yourself.",
    "You are doing your best — and that is enough.",
    "Notice one thing in your environment that feels comforting.",
    "Try free-writing for 2 minutes. No filter.",
    "Write down something kind someone said to you recently.",
    "Your thoughts are safe here.",
    "There's power in pausing to reflect.",
    "You are worthy of rest and restoration.",
    "Start with 'Today, I feel…' and go from there.",
    "Even one word is a step forward.",
    "Turn your inner critic into an inner coach.",
    "Breathe in. Write it out. Let go.",
    "Progress over perfection. Always.",
    "Your journal is your brave space.",
    "Journaling helps your brain declutter. Be gentle with yourself.",
  ];

  export const emotionTips: Record<string, string[]> = {
    excited: [
      "Capture what's making you excited — ride the momentum!",
      "What are you looking forward to most? Write it down.",
      "Excitement is energy. How can you channel it productively?",
      "Use your excitement to inspire a future goal.",
      "Reflect on how this excitement started — what sparked it?",
    ],
    peaceful: [
      "Write about what brought you peace today — protect it.",
      "Peace often hides in the small moments. Describe one.",
      "What does peace feel like in your body today?",
      "Capture the calm — it's a reminder for stormier days.",
      "Think of a place or person that enhances your peace.",
    ],
    accomplished: [
      "Document your achievement — big or small, it matters.",
      "How did you overcome a challenge to get here?",
      "Who would you like to share this win with?",
      "What strength in you led to this accomplishment?",
      "Write a short message of pride to your past self.",
    ],
    reflective: [
      "What lesson did today teach you?",
      "Is there a pattern or insight emerging from recent days?",
      "Describe a moment that made you pause and think.",
      "What question is lingering in your mind today?",
      "Write without editing — reflection flows best unfiltered.",
    ],
    anxious: [
      "Name what's making you anxious — naming reduces fear.",
      "Breathe. Start writing without pressure or form.",
      "Is your anxiety tied to something in your control?",
      "You don't need solutions — just space to feel.",
      "Describe a safe place. Go there in your writing.",
    ],
  };
  
  