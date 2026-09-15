import React from "react";

// Schéma vectoriel des distances de la course en 3 x 50 m, avec un zoom sur
// la structure d'une zone de transmission (zone d'élan 5 m + zone de
// transmission 20 m, centrée sur le milieu).
export default function SchemaDistances() {
  return (
    <div className="rounded-lg border border-white/10 bg-piste-nuit/40 p-3 sm:p-4">
      <svg viewBox="0 0 340 60" className="w-full h-auto text-piste-craie">
        <line x1="10" y1="30" x2="330" y2="30" stroke="currentColor" strokeWidth="1.2" />
        {[
          [10, "Départ", "0 m"],
          [116, "Milieu ZT1", "50 m"],
          [223, "Milieu ZT2", "100 m"],
          [330, "Arrivée", "150 m"],
        ].map(([x, label, sub]) => (
          <g key={label}>
            <line x1={x} y1="24" x2={x} y2="36" stroke="currentColor" strokeWidth="1.2" />
            <text x={x} y="48" fontSize="7" textAnchor="middle" fill="currentColor" opacity="0.85">{label}</text>
            <text x={x} y="56" fontSize="6" textAnchor="middle" fill="currentColor" opacity="0.5">{sub}</text>
          </g>
        ))}
        {[[10, 116], [116, 223], [223, 330]].map(([a, b], i) => (
          <text key={i} x={(a + b) / 2} y="16" fontSize="7" textAnchor="middle" fill="currentColor" opacity="0.7">50 m</text>
        ))}
      </svg>

      <div className="my-2 border-t border-white/5" />

      <svg viewBox="0 0 260 70" className="w-full h-auto text-piste-craie">
        <line x1="10" y1="35" x2="250" y2="35" stroke="currentColor" strokeWidth="1.2" />
        {[
          [30, "-15 m", "Début élan"],
          [90, "-10 m", "Début ZT"],
          [150, "0", "Milieu ZT"],
          [210, "+10 m", "Fin ZT"],
        ].map(([x, sub, label], i) => (
          <g key={label}>
            <line x1={x} y1="29" x2={x} y2="41" stroke="currentColor" strokeWidth="1.2" />
            <text x={x} y={i % 2 === 0 ? "56" : "64"} fontSize="6.5" textAnchor="middle" fill="currentColor" opacity="0.85">{label}</text>
            <text x={x} y={i % 2 === 0 ? "64" : "72"} fontSize="6" textAnchor="middle" fill="currentColor" opacity="0.5">{sub}</text>
          </g>
        ))}
        {/* zone d'élan : pointillés */}
        <line x1="30" y1="16" x2="90" y2="16" stroke="currentColor" strokeWidth="1" strokeDasharray="3,2" opacity="0.8" />
        <line x1="30" y1="12" x2="30" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.8" />
        <line x1="90" y1="12" x2="90" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.8" />
        <text x="60" y="9" fontSize="6.5" textAnchor="middle" fill="currentColor" className="text-piste-ambre" opacity="0.9">Zone d'élan (5 m)</text>
        {/* zone de transmission : trait plein */}
        <line x1="90" y1="24" x2="210" y2="24" stroke="currentColor" strokeWidth="1.4" />
        <line x1="90" y1="20" x2="90" y2="28" stroke="currentColor" strokeWidth="1.2" />
        <line x1="210" y1="20" x2="210" y2="28" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <p className="text-[11px] text-piste-ambre text-center mt-1">Zone de transmission (20 m)</p>

      <p className="text-[11px] text-piste-craie/50 mt-3 leading-relaxed">
        Départ → milieu ZT1 = 50 m · Milieu ZT1 → milieu ZT2 = 50 m · Milieu ZT2 → arrivée = 50 m. Début de la zone
        de transmission = 10 m avant le milieu de la zone (fin = 10 m après, soit 20 m au total). Début de la zone
        d'élan = 5 m avant le début de la zone de transmission.
      </p>
    </div>
  );
}
