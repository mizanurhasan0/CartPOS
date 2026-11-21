export function formatDate(dateString) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', options);
    const parts = formattedDate.split(' ');
    return parts[1] + ' ' + parts[0] + ', ' + parts[2];
  }

export function formatTimeWithAMPM(dateString) {
  const date = new Date(dateString);
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return date.toLocaleTimeString('en-US', options);
}
