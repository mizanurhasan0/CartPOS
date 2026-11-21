
/**
 * This function is used to change user default timezone. 
 * @returns new date which timezone +00
 */
export default function changeDate() {
  const date = new Date();
  date.toLocaleString('en-US', { timeZone: 'Europe/London' });
  return date;
}