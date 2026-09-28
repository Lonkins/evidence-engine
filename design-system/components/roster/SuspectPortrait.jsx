import React from "react";

/**
 * SuspectPortrait — stylised noir busts, split-lit and drawn rather than
 * photographed so each witness reads instantly. The shadow half warms toward
 * oxblood as interrogation pressure (contradictions) accumulates.
 *
 * `who` selects one of the built-in busts; pass `initial` to render a lettered
 * monogram plate instead (for bring-your-own witnesses).
 */
export function SuspectPortrait({ who, initial, pressure = 0, className = "" }) {
  const shadow =
    pressure > 0 ? `rgba(126, 29, 31, ${0.35 + pressure * 0.45})` : "#0e0b08";
  const uid = who || "byo";

  if (initial && !who) {
    return (
      <div className={`ee-portrait ee-portrait--initial ${className}`}>
        <span className="ee-portrait__initial">{initial}</span>
      </div>
    );
  }

  return (
    <svg viewBox="0 0 120 130" className={`ee-portrait__svg ${className}`} role="img" aria-label="Suspect portrait">
      <defs>
        <linearGradient id={`lamp-${uid}`} x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0%" stopColor="#e9d8ae" />
          <stop offset="55%" stopColor="#caa86a" />
          <stop offset="100%" stopColor="#7d6238" />
        </linearGradient>
        <linearGradient id={`coat-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b3122" />
          <stop offset="100%" stopColor="#171209" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="56" r="44" fill={`url(#lamp-${uid})`} opacity="0.14" />

      {who === "curator" && (
        <g>
          <path d="M18 130 C22 102 40 94 60 94 C80 94 98 102 102 130 Z" fill={`url(#coat-${uid})`} />
          <path d="M52 96 L60 110 L68 96 L60 92 Z" fill="#0d0a07" />
          <rect x="53" y="74" width="14" height="22" rx="6" fill={`url(#lamp-${uid})`} />
          <path d="M40 44 C40 28 49 20 60 20 C71 20 80 28 80 44 C80 62 72 74 60 74 C48 74 40 62 40 44 Z" fill={`url(#lamp-${uid})`} />
          <path d="M60 20 C71 20 80 28 80 44 C80 62 72 74 60 74 Z" fill={shadow} opacity="0.82" />
          <path d="M36 50 C32 22 46 12 60 12 C76 12 86 24 84 52 C83 58 80 60 79 56 C78 44 76 36 70 32 C62 38 48 38 44 30 C39 36 40 48 40 56 C39 61 37 58 36 50 Z" fill="#11100d" />
          <path d="M36 50 C35 60 36 66 34 72 L44 68 C41 62 40 56 40 52 Z" fill="#11100d" />
        </g>
      )}

      {who === "assessor" && (
        <g>
          <path d="M22 130 C26 104 42 96 60 96 C78 96 94 104 98 130 Z" fill={`url(#coat-${uid})`} />
          <path d="M52 98 L60 112 L68 98 L60 94 Z" fill="#d8c9a4" />
          <path d="M58 98 L60 110 L62 98 L60 95 Z" fill="#5a2020" />
          <rect x="53" y="76" width="14" height="22" rx="6" fill={`url(#lamp-${uid})`} />
          <path d="M42 46 C42 30 50 22 60 22 C70 22 78 30 78 46 C78 64 70 78 60 78 C50 78 42 64 42 46 Z" fill={`url(#lamp-${uid})`} />
          <path d="M60 22 C70 22 78 30 78 46 C78 64 70 78 60 78 Z" fill={shadow} opacity="0.82" />
          <path d="M42 44 C40 26 50 16 60 16 C72 16 80 26 78 42 C74 32 68 28 60 28 C52 28 46 34 42 44 Z" fill="#191510" />
          <circle cx="51" cy="48" r="6.5" fill="none" stroke="#231c12" strokeWidth="2" />
          <circle cx="69" cy="48" r="6.5" fill="none" stroke="#231c12" strokeWidth="2" />
          <path d="M57.5 48 L62.5 48" stroke="#231c12" strokeWidth="2" />
        </g>
      )}

      {who === "collector" && (
        <g>
          <path d="M16 130 C20 102 38 93 60 93 C82 93 100 102 104 130 Z" fill="#5e191c" />
          <path d="M46 96 L60 116 L52 98 Z" fill="#43090c" />
          <path d="M74 96 L60 116 L68 98 Z" fill="#43090c" />
          <circle cx="60" cy="98" r="5" fill="#caa86a" />
          <rect x="53" y="74" width="14" height="22" rx="6" fill={`url(#lamp-${uid})`} />
          <path d="M41 46 C41 30 49 22 60 22 C71 22 79 30 79 46 C79 62 71 75 60 75 C49 75 41 62 41 46 Z" fill={`url(#lamp-${uid})`} />
          <path d="M60 22 C71 22 79 30 79 46 C79 62 71 75 60 75 Z" fill={shadow} opacity="0.82" />
          <path d="M38 48 C34 24 46 10 60 10 C74 10 86 22 82 48 C80 54 77 54 77 48 C78 36 72 28 60 26 C48 28 42 36 43 48 C43 54 40 54 38 48 Z" fill="#b9ab90" />
          <path d="M50 12 C54 6 66 6 70 12 C66 10 54 10 50 12 Z" fill="#b9ab90" />
          <circle cx="44" cy="58" r="2" fill="#e8c97e" />
        </g>
      )}
    </svg>
  );
}
