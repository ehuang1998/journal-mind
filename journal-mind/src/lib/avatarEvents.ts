// Simple event system for avatar updates
// This helps us synchronize avatar changes across different components

const AVATAR_UPDATED_KEY = 'avatarUpdated';

export const avatarEvents = {
  // Signal that the avatar has been updated
  triggerUpdate: () => {
    if (typeof window !== 'undefined') {
      // Set a timestamp in localStorage to signal the update
      localStorage.setItem(AVATAR_UPDATED_KEY, Date.now().toString());
      
      // Dispatch a custom event that components can listen for
      window.dispatchEvent(new Event('avatar-updated'));
    }
  },
  
  // Set up a listener for avatar updates
  // Returns a cleanup function to remove the listener
  onUpdate: (callback: () => void): (() => void) => {
    if (typeof window === 'undefined') return () => {};
    
    const handler = () => {
      callback();
    };
    
    window.addEventListener('avatar-updated', handler);
    
    // Return a cleanup function
    return () => {
      window.removeEventListener('avatar-updated', handler);
    };
  },
  
  // Get the last update timestamp
  getLastUpdateTime: (): number => {
    if (typeof window === 'undefined') return 0;
    
    const timestamp = localStorage.getItem(AVATAR_UPDATED_KEY);
    return timestamp ? parseInt(timestamp, 10) : 0;
  }
}; 