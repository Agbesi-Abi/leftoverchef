// Format date as "Mon, Jan 1"
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Get array of dates for a week starting from the given date
export function getWeekDates(startDateString: string): string[] {
  const startDate = new Date(startDateString);
  const weekDates: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  
  return weekDates;
}

// Get the next week's start date
export function getNextWeekStart(currentStartDate: string): string {
  const date = new Date(currentStartDate);
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}

// Get the previous week's start date
export function getPreviousWeekStart(currentStartDate: string): string {
  const date = new Date(currentStartDate);
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

// Check if a date is today
export function isToday(dateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  
  return today.getTime() === date.getTime();
}

// Get day name from date
export function getDayName(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}