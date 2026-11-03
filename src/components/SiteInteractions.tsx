"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initHome } from "@/lib/interactions/home";
import { driveWithScrollTrigger } from "@/lib/gsap-driver";

/**
 * Mounts the framework-free interaction modules against the rendered DOM and
 * tears them down on route change. Every module tolerates missing elements,
 * so the same call works on the homepage and on secondary pages (where only
 * the nav, footer X-ray and language switch are present).
 */
export function SiteInteractions() {
  const pathname = usePathname();
  useEffect(() => {
    // mark the current page in both navs so the liquid highlight has a resting place
    document.querySelectorAll<HTMLAnchorElement>(".nav-links a, .menu-links a").forEach((a) => {
      const href = a.getAttribute("href") ?? "";
      const isCurrent = href === pathname || (href !== "/" && !href.includes("#") && pathname.startsWith(href + "/"));
      if (isCurrent) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const cleanup = initHome(document, { driveConstruction: driveWithScrollTrigger });
    return cleanup;
  }, [pathname]);
  return null;
}
