export function secondsToHHMMSS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Ha csak MM:SS kell, és biztosan nincs óra, akkor az egyszerűbb.
  // De ha óra is van, így lesz professzionális:
  const hDisplay = hours > 0 ? `${hours}:` : "";
  const mDisplay = minutes.toString().padStart(2, "0");
  const sDisplay = seconds.toString().padStart(2, "0");

  return `${hDisplay}${mDisplay}:${sDisplay}`;
}
