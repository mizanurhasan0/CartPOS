/**
* duration function is used to calculate the duration between current time and provided start time.
* @param {string} startTime - The start time in ISO string format.
* @returns {string} - Returns the duration in human readable format
* (e.g. "2m" for 2 minutes) or '0s' if the duration is less than a second.
* @throws Will log an error message if no start time is provided.
*/
export default function duration(startTime = new Date().getTime()) {
  if (!startTime) return console.log('Please provide start time');
  const endTime = (new Date()).getTime();
  const diff = endTime - startTime;
  const intervals = [
    { y: 31557600000 },
    { mos: 2629800000 },
    { d: 86400000 },
    { h: 3600000 },
    { m: 60000 },
    { s: 1000 },
  ];
  const d = intervals.filter((t) => t[Object.keys(t)] <= diff)[0];
  return d
    ? `${Math.floor(diff / d[Object.keys(d)])}${Object.keys(d)}`
    : '0s';
}
