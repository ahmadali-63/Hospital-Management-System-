'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Dynamic Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(51, 128, 139, 0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15, 217, 248, 0.05)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-70" />

      {/* Sweeping Radiant Aurora Wave Beam */}
      <div className="aurora-beam absolute -inset-[100%] opacity-35 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(40, 81, 88, 0.18)_0deg,transparent_60deg,rgba(240, 230, 241, 0.18)_120deg,transparent_180deg,rgba(99,102,241,0.18)_240deg,transparent_300deg,rgba(6,182,212,0.18)_360deg)] blur-3xl" />

      {/* Primary Vibrant Neon Aurora Orbs */}
      {/* Orb 1: Electric Cyan - Drifts top-left across center */}
      <div className="aurora-orb-cyan absolute -top-20 -left-20 h-[520px] w-[520px] rounded-full bg-cyan-400/40 blur-[65px] will-change-transform" />

      {/* Orb 2: Vivid Fuchsia/Magenta - Drifts bottom-right */}
      <div className="aurora-orb-fuchsia absolute -bottom-28 -right-28 h-[560px] w-[560px] rounded-full bg-fuchsia-500/35 blur-[70px] will-change-transform" />

      {/* Orb 3: Radiant Indigo/Violet - Orbits upper-right */}
      <div className="aurora-orb-indigo absolute top-1/4 right-[10%] h-[480px] w-[480px] rounded-full bg-indigo-500/35 blur-[65px] will-change-transform" />

      {/* Orb 4: Luminous Emerald - Flows bottom-left */}
      <div className="aurora-orb-emerald absolute bottom-1/4 left-[15%] h-[460px] w-[460px] rounded-full bg-emerald-400/30 blur-[60px] will-change-transform" />

      {/* Orb 5: Warm Amber - Pulses in center */}
      <div className="aurora-orb-amber absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-amber-400/20 blur-[60px] will-change-transform" />

      {/* Orb 6: Rose Pink - Floats mid-top */}
      <div className="aurora-orb-rose absolute top-[5%] left-[45%] h-[380px] w-[380px] rounded-full bg-rose-500/25 blur-[55px] will-change-transform" />

      {/* Subtle Ambient Radial Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#050814]/40 to-[#050814]/90" />
    </div>
  );
}
