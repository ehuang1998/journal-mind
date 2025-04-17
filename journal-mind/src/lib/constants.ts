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