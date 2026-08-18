import { SPHttpClient } from '@microsoft/sp-http';

export interface ICurrentUser {
  displayName: string;
  loginName: string;
}

export interface ITeamRadarProps {
  radarTitle: string;
  listName: string;
  weeksToShow: number;
  siteUrl: string;
  spHttpClient: SPHttpClient;
  currentUser: ICurrentUser;
}

export type Workload = 'Light' | 'Balanced' | 'Stretched';

export interface IPulseEntry {
  Id: number;
  PersonName: string;
  WeekStartDate: string;
  Workload: Workload;
  Mood: number;
  Blocker: string;
}

export const WORKLOAD_OPTIONS: Workload[] = ['Light', 'Balanced', 'Stretched'];

/** Cell color blends workload (hue) with mood (intensity). */
export function getCellColor(workload: Workload, mood: number): string {
  const base: Record<Workload, [number, number, number]> = {
    Light: [18, 184, 134],      // green
    Balanced: [47, 111, 237],   // blue
    Stretched: [230, 73, 128]   // pink/red
  };
  const [r, g, b] = base[workload] || base.Balanced;
  // Lower mood -> darken/desaturate slightly toward gray
  const moodFactor = Math.max(0.35, Math.min(1, mood / 5));
  const gray = 200;
  const mix = (c: number) => Math.round(c * moodFactor + gray * (1 - moodFactor));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** Returns the Monday of the week containing the given date, as YYYY-MM-DD. */
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
