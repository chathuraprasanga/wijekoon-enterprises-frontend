export const msFromNow = (seconds: number): number => {
  return Date.now() + seconds * 1000;
};

export const secondsUntil = (timestamp: number): number => {
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
};
