export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time?: string;
  venue?: string;
  rsvps?: number;
  hasRSVPed?: boolean;
  __rsvpPending?: boolean; // 👈 add this line
}
