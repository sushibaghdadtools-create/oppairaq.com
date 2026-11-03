import Link from "next/link";
import { T } from "@/components/T";

export default function NotFound() {
  return (
    <div className="wrap page-head" style={{ minHeight: "60vh" }}>
      <p className="mute small">404</p>
      <T as="h1" k="nf.title" className="h2" />
      <T as="p" k="nf.lede" className="lede mute" />
      <Link className="btn" href="/" style={{ justifySelf: "start" }}>
        <T k="nf.home" />
      </Link>
    </div>
  );
}
