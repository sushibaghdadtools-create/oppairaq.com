/**
 * Growth partners, past and present. Logos live in /public/partners (square
 * PNGs on white). Set `status` to "past" for former partners; they show
 * slightly faded on the wheel.
 */
export interface Partner {
  name: string;
  logo?: string;
  status: "present" | "past";
  /** A mark that fills its canvas edge to edge; shown filling the circle. */
  square?: boolean;
}

export const PARTNERS: Partner[] = [
  { name: "Independent High Electoral Commission", logo: "/partners/ihec.png", status: "present" },
  { name: "Wikipedia", logo: "/partners/wikipedia.png", status: "present" },
  { name: "Sushi Baghdad", logo: "/partners/sushi-baghdad.png", status: "present" },
  { name: "Alnokhba Laboratories", logo: "/partners/alnokhba.png", status: "present" },
  { name: "Deutsche Welle", logo: "/partners/dw.png", status: "present", square: true },
  { name: "Q", logo: "/partners/q.png", status: "present", square: true },
];
