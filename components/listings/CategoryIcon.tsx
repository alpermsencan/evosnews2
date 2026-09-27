import React from "react";

export function CategoryIcon({ slug, className = "h-8 w-8" }: { slug: string; className?: string }) {
  switch (slug) {
    case "elektrikli-otomobil":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M5 12h12" />
        </svg>
      );
    case "elektrikli-arazi-suv-pickup":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 16V13c0-1.1.9-2 2-2h2l3-5h7l2 5h3c1.1 0 2 .9 2 2v3" />
          <circle cx="7" cy="16" r="2.5" />
          <circle cx="17" cy="16" r="2.5" />
          <path d="M10 8h4" />
          <path d="M2 18h2.5" />
          <path d="M9.5 18h5" />
          <path d="M19.5 18H22" />
        </svg>
      );
    case "elektrikli-minivan-panelvan":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="9" rx="2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M2 12h20" />
          <path d="M14 7v5" />
          <path d="M7 7v5" />
        </svg>
      );
    case "elektrikli-motosiklet":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6h-3l-3 6.5h6.5l3.5-3.5L17.5 6" />
          <path d="M5.5 17.5l4-7.5" />
          <path d="M14 9l4.5 8.5" />
        </svg>
      );
    case "elektrikli-atv":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="17" r="3" />
          <circle cx="19" cy="17" r="3" />
          <path d="M8 17h8" />
          <path d="M5 14l3-5h8l3 5" />
          <path d="M10 9l2-4h2" />
          <path d="M12 11h4" />
        </svg>
      );
    case "elektrikli-utv":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16V13l3-6h8l4 6v3" />
          <circle cx="7" cy="17" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <path d="M7 7v6" />
          <path d="M15 7v6" />
          <path d="M7 10h8" />
        </svg>
      );
    case "elektrikli-kickscooter":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
          <path d="M7 19h10" />
          <path d="M18 17L14 4h-3" />
          <path d="M12 4h4" />
        </svg>
      );
    case "elektrikli-hizmet-araclari":
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17V8a2 2 0 0 1 2-2h9l4 4v7" />
          <circle cx="7.5" cy="17.5" r="2.5" />
          <circle cx="16.5" cy="17.5" r="2.5" />
          <path d="M10 17h4" />
          <path d="M2 17h3" />
          <path d="M19 17h3" />
          <path d="M15 6v4h4" />
        </svg>
      );
  }
}
