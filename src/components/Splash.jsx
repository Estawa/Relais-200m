import { useEffect } from "react";

export default function Splash({ onTermine }) {
  useEffect(() => {
    const t = setTimeout(onTermine, 1100);
    return () => clearTimeout(t);
  }, [onTermine]);

  return (
    <div
      onClick={onTermine}
      className="min-h-screen flex flex-col items-center justify-center gap-5 bg-piste-nuit text-piste-craie cursor-pointer"
    >
      <img src="/icons/icon-512.png" alt="" className="w-32 h-32 rounded-3xl shadow-2xl shadow-black/50" />
      <div className="text-center">
        <h1 className="font-display text-4xl font-800 tracking-wide uppercase leading-none">
          Relais <span className="text-piste-brique">200m</span>
        </h1>
        <p className="text-xs text-piste-craie/40 mt-2">By C. Guilhem</p>
      </div>
    </div>
  );
}
