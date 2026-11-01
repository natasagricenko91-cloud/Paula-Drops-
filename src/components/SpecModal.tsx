import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';

interface SpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecModal: React.FC<SpecModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<1 | 2 | 3 | 4>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-body">
      <div className="w-full max-w-4xl h-[640px] bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 border-b-2 border-slate-950 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📐</span>
            <div>
              <h2 className="font-brawl text-2xl text-sky-200 tracking-wide brawl-stroke-sm">
                PAULA DROPS: TECHNICAL BLUEPRINT & SYSTEM SPECIFICATION
              </h2>
              <p className="text-xs text-sky-300 font-mono">
                PAULA DROPS CBT DEV V1 · PRINCIPAL GAME DIRECTOR · LEAD ARCHITECT · SUPERCELL UI/UX DESIGNER
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-brawl text-xl flex items-center justify-center border border-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2 text-xs font-brawl">
          <button
            onClick={() => setActiveSection(1)}
            className={`py-2 px-3 rounded-t-xl transition-colors ${
              activeSection === 1
                ? 'bg-slate-800 text-sky-400 border-t-2 border-sky-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. CORE GAMEPLAY & MECHANICS
          </button>
          <button
            onClick={() => setActiveSection(2)}
            className={`py-2 px-3 rounded-t-xl transition-colors ${
              activeSection === 2
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. UI/UX DESIGN SYSTEM & DEBUG
          </button>
          <button
            onClick={() => setActiveSection(3)}
            className={`py-2 px-3 rounded-t-xl transition-colors ${
              activeSection === 3
                ? 'bg-slate-800 text-yellow-400 border-t-2 border-yellow-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. MAINTENANCE & SUPPORT
          </button>
          <button
            onClick={() => setActiveSection(4)}
            className={`py-2 px-3 rounded-t-xl transition-colors ${
              activeSection === 4
                ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4. 3 ORIGINAL BRAWLERS
          </button>
        </div>

        {/* Scrollable Specification Document */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-300 text-xs leading-relaxed space-y-6">
          {activeSection === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-brawl text-lg text-sky-400">
                  SECTION 1: CORE GAMEPLAY & MECHANICS (EXACT BRAWL STARS REPLICATION)
                </h3>
                <p className="text-slate-400 text-[11px]">
                  Production Unity/C# architecture, network synchronization, and combat physics pipeline.
                </p>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-sm text-white">1.1 Virtual Dual-Joystick Control Architecture</h4>
                <p>
                  The input system implements two decouple-able virtual joysticks operating on a 60Hz tick simulation:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>
                    <strong className="text-sky-300">Left Joystick (360° Omnidirectional Movement):</strong> Floating or pinned anchor mode. Clamped to dynamic circle radius <code className="text-amber-300">R = 72px</code>. Normalizes normalized direction vector <code className="text-amber-300">(dx, dy)</code> and translates the kinematic Rigidbody with linear deceleration damping (<code className="text-amber-300">Mathf.Lerp</code> with k=18.0).
                  </li>
                  <li>
                    <strong className="text-sky-300">Right Joystick (Skill-Shot Aiming & Auto-Fire):</strong>
                    <br />
                    - <em>Auto-Aim (Tap):</em> Raycasts against enemy colliders in vision range. Automatically acquires the closest non-stealthed enemy Brawler and fires along the direct angle.
                    <br />
                    - <em>Manual Drag (Skill-Shot):</em> Renders a dynamic ground projector (Line for snipers/discs, Cone for spread shotguns, Circle for lobbed mortars). Releasing outside deadzone (<code className="text-amber-300">dist &gt; 0.25 * R</code>) fires in the targeted vector. Dragging back inside the red center cancels the attack.
                  </li>
                  <li>
                    <strong className="text-yellow-300">Yellow Super Joystick & Gadget Buttons:</strong> Charged by successful attack hitboxes. Dedicated skull joystick triggers game-changing supers.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-sm text-white">1.2 Combat Physics & Environment Mechanics</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Deterministic Hitbox Detection:</strong> Circular 2.5D hitboxes (<code className="text-amber-300">Physics2D.OverlapCircle</code> or swept 3D spheres). Projectile trajectories are evaluated server-authoritatively at 30 ticks/second with client-side rollback prediction.
                  </li>
                  <li>
                    <strong>Line-of-Sight Bushes (Stealth):</strong> Bush tiles feature an inner trigger collider. When inside, the Brawler becomes invisible to opponents and opaque (50% alpha) to teammates. Stealth breaks for 2.0s upon firing or taking damage.
                  </li>
                  <li>
                    <strong>Destructible Environment Obstacles:</strong> Wooden crates (3,000 HP) and stone walls. Standard attacks are blocked by walls; supers like Gulliver's Whirlpool shatter wall colliders into pooled debris particles.
                  </li>
                  <li>
                    <strong>Toxic Fog (Showdown Mode):</strong> Radial smoke field shrinking continuously at 0.7 units/sec toward the map epicenter. Standing inside the smoke inflicts cumulative 1,000 damage/sec.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-sm text-white">1.3 Progression Loops & Economy</h4>
                <p>
                  <strong>Trophy Road:</strong> 0 to 50,000 trophies milestone track with tiers rewarding Mega Boxes, Credits, Gold, and Power Points.
                  <br />
                  <strong>Brawl Pass:</strong> Dual-tier ladder (Free vs Brawl Pass Plus). Daily/seasonal quests supply Pass Tokens.
                  <br />
                  <strong>Mastery Levels:</strong> Wood I → Bronze I-III → Silver I-III → Gold I-III with mastery points awarded upon victorious 3v3 matches.
                </p>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-brawl text-lg text-amber-400">
                  SECTION 2: UI/UX DESIGN SYSTEM & DEV DEBUG MENU
                </h3>
                <p className="text-slate-400 text-[11px]">
                  Supercell signature design constitution, cartoon bevel button physics, and developer tools.
                </p>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-sm text-white">2.1 Supercell Signature Visual Aesthetic</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Typography:</strong> Chunky rounded display face (Supercell "Lilita One" style) with deep dark blue strokes (<code className="text-amber-300">-webkit-text-stroke: 3px #081126</code>) and 3D extrusion drop-shadows.
                  </li>
                  <li>
                    <strong>Skewed 3D Cartoon Buttons:</strong> Skewed by -4° to -6° with dual-tone gradient fill, 3px solid border, 6px bottom bevel drop shadow. On press (<code className="text-amber-300">:active</code>), buttons translate downward 4px while bevel collapses to 2px for tangible tactile impact.
                  </li>
                  <li>
                    <strong>Color Palette:</strong>
                    <br />
                    • Yellow/Gold CTA: <code className="text-yellow-400">#ffe033</code> to <code className="text-amber-500">#ff9e00</code>
                    <br />
                    • Battle Green: <code className="text-emerald-400">#4ade80</code> to <code className="text-green-600">#16a34a</code>
                    <br />
                    • Trophy Blue: <code className="text-sky-400">#38bdf8</code> to <code className="text-blue-600">#0284c7</code>
                    <br />
                    • Brawl Pass Purple: <code className="text-purple-400">#c084fc</code> to <code className="text-purple-800">#7e22ce</code>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-sm text-white">2.2 Main Lobby Layout Hierarchy</h4>
                <p>
                  • <strong>Top Bar:</strong> Trophies with Trophy Road progress, Gold balance, Gem balance, and Supercell ID profile button.
                  <br />
                  • <strong>Central 3D Showcase:</strong> Golden rotating pedestal presenting the selected Brawler with idle breathing animation, power level, and mastery badge.
                  <br />
                  • <strong>Bottom Bar Navigation:</strong> Shop, Brawlers, Play / Lobby, Brawl Pass, Club.
                  <br />
                  • <strong>Giant "BATTLE" CTA:</strong> Massive skewed green button right above the bottom dock.
                </p>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-sm text-white">2.3 Developer Debug Drawer Architecture</h4>
                <p>
                  Accessed via the floating developer wrench. Divided into 4 production modules:
                </p>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-sky-400">1. Camera Controls:</strong>
                    <p>Isometric Top-Down (55° pitch), Crazy Cam 3D (third-person chase), Free Look stadium spectator.</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-amber-400">2. Account Injectors:</strong>
                    <p>+9,999 Gems, +50,000 Gold, +500 Trophies, Unlock All Brawlers, Max Power 11 on all roster.</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-emerald-400">3. Server / Match Overrides:</strong>
                    <p>Toggle Bot AI execution, Force Victory / Defeat, Game Speed slider (0.5x to 3.0x), Infinite Ammo, God Mode.</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-rose-400">4. Danger Zone:</strong>
                    <p>Trigger Maintenance Break overlay, Force Server Timeout/Disconnect error, Show Account Deletion dialog.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-brawl text-lg text-yellow-400">
                  SECTION 3: MAINTENANCE BREAK & SUPPORT SYSTEM
                </h3>
                <p className="text-slate-400 text-[11px]">
                  Server maintenance screen specifications and live customer support pipeline.
                </p>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-sm text-white">3.1 Maintenance Break Protocol</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Visual Design:</strong> Darkened blurred backdrop with repeating yellow-and-black diagonal hazard stripes (<code className="text-amber-300">#facc15</code> / <code className="text-amber-300">#000000</code>).
                  </li>
                  <li>
                    <strong>Dynamic Live Countdown:</strong> Real-time timer updating every second (<code className="text-amber-300">14m 32s</code>) with progress fill bar.
                  </li>
                  <li>
                    <strong>"Reload Connection" Button:</strong> Sends an asynchronous ping to the gateway API endpoint to re-verify cluster availability without forcing a full client restart.
                  </li>
                  <li>
                    <strong>Patch Notes Feed:</strong> In-screen preview of balance adjustments and bug fixes deployed during the downtime.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3">
                <h4 className="font-brawl text-sm text-white">3.2 In-App Help & Player Support</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Knowledge Base / FAQs:</strong> Searchable categorized tiles (Account Recovery, Purchases, Bug Reports, Fair Play Policy).
                  </li>
                  <li>
                    <strong>Interactive Support Bot ("Bot Otto"):</strong> Built-in automated conversational widget that responds dynamically to player queries regarding Brawlers, server status, gems, and bug submissions.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-brawl text-lg text-emerald-400">
                  SECTION 4: 3 UNIQUE ORIGINAL BRAWLERS (DESIGN CONCEPTS)
                </h3>
                <p className="text-slate-400 text-[11px]">
                  Complete competitive balancing, kit synergy, star powers, gadgets, and hypercharges.
                </p>
              </div>

              {/* BRAWLER 1: VEXA */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border-2 border-sky-500/60 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-brawl text-base text-sky-300">1. VEXA — THE CHRONO ASSASSIN</h4>
                  <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded font-brawl border border-purple-400">
                    MYTHIC · ASSASSIN
                  </span>
                </div>
                <p className="text-slate-300 text-xs">
                  <strong>Lore:</strong> A quantum horologist from the Chrono Factory who bends timelines to rewrite combat mistakes.
                </p>
                <div className="text-xs space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div><strong>Main Attack (Chronoblades):</strong> Fires 3 spinning temporal discs in a fan. Discs accelerate; hitting enemies at max range recovers 0.5 ammo. (480 x 3 = 1440 dmg, 8.5 range, 1.3s reload).</div>
                  <div><strong>Super (Paradox Warp):</strong> Places an anchor and dashes forward. Pressing again within 4s snaps her back, healing 40% of damage taken and releasing a 1200 dmg shockwave.</div>
                  <div><strong>Star Powers:</strong> (1) <em>Rewind Resonance:</em> Echo pulse slows enemies by 35% for 2.5s. (2) <em>Temporal Loop:</em> Hitting all 3 discs restores 1 full ammo.</div>
                  <div><strong>Gadgets:</strong> (1) <em>Stasis Shell:</em> Freezes herself invulnerable for 1.2s. (2) <em>Fast Forward:</em> Next attack travels 60% faster and pierces walls.</div>
                  <div><strong>Hypercharge (Quantum Cataclysm):</strong> +25% Speed, +20% Damage, +15% Shield; Super spawns 3 chain-detonating temporal rifts.</div>
                </div>
              </div>

              {/* BRAWLER 2: GULLIVER */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border-2 border-amber-500/60 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-brawl text-base text-amber-300">2. GULLIVER — SIEGE SALVAGER</h4>
                  <span className="text-[10px] bg-amber-900 text-amber-200 px-2 py-0.5 rounded font-brawl border border-amber-400">
                    EPIC · ARTILLERY / TANK
                  </span>
                </div>
                <p className="text-slate-300 text-xs">
                  <strong>Lore:</strong> A deep-sea salvage captain clad in a brass diving bell equipped with a pressurized steam mortar.
                </p>
                <div className="text-xs space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div><strong>Main Attack (Depth Charge):</strong> Lobs a canister over walls. Upon landing, detonates for 1800 damage and splinters into 3 mini-shrapnel mines dealing 450 damage each. (9.2 range, 1.8s reload).</div>
                  <div><strong>Super (Whirlpool Barrage):</strong> Fires a titanic anchor that crashes into the arena, shattering environmental walls and sucking enemies toward its epicenter while dealing 2200 damage.</div>
                  <div><strong>Star Powers:</strong> (1) <em>Barnacle Plating:</em> Gains a 25% damage reduction shield when below 40% HP. (2) <em>Shockwave Shrapnel:</em> Mini-shrapnel knocks enemies back 1.5 tiles.</div>
                  <div><strong>Gadgets:</strong> (1) <em>Steam Vent:</em> Blasts steam knocking back enemies and blinding them for 1.5s. (2) <em>Sonar Ping:</em> Reveals all enemies in bushes map-wide for 5s.</div>
                  <div><strong>Hypercharge (Tidal Overload):</strong> +20% Speed, +25% Damage, +25% Shield; Whirlpool spawns boiling geysers that stun enemies for 1.2s.</div>
                </div>
              </div>

              {/* BRAWLER 3: NYX */}
              <div className="bg-slate-900/80 rounded-2xl p-4 border-2 border-emerald-500/60 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-brawl text-base text-emerald-300">3. NYX — BIOLUMINESCENT SPRITE</h4>
                  <span className="text-[10px] bg-yellow-900 text-yellow-200 px-2 py-0.5 rounded font-brawl border border-yellow-400">
                    LEGENDARY · SUPPORT / CONTROLLER
                  </span>
                </div>
                <p className="text-slate-300 text-xs">
                  <strong>Lore:</strong> An ancient subterranean spirit who commands glowing fungal spores to regenerate allies and poison rivals.
                </p>
                <div className="text-xs space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div><strong>Main Attack (Spore Burst):</strong> Fires 3 bioluminescent spores in an arc. Allies hit gain 850 HP heal; enemies hit take 1350 damage plus 200 poison damage/sec for 3s. (8.8 range, 1.4s reload).</div>
                  <div><strong>Super (Luminescent Canopy):</strong> Spawns a glowing mushroom grove (5-tile radius). All allies inside gain complete invisibility and +15% move speed even while attacking! Lasts 7s.</div>
                  <div><strong>Star Powers:</strong> (1) <em>Symbiotic Link:</em> Healing allies charges Super by 12%. (2) <em>Toxic Photosynthesis:</em> Enemies inside canopy suffer 450 poison damage/sec.</div>
                  <div><strong>Gadgets:</strong> (1) <em>Spore Bloom:</em> Detonates active spores for 1200 HP ally heal and 800 burst enemy damage. (2) <em>Fungal Snare:</em> Roots poisoned enemies for 1.3s.</div>
                  <div><strong>Hypercharge (Bioluminescent Bloom):</strong> +30% Speed, +15% Damage, +20% Shield; Canopy expands by 50% radius and grants continuous 500 HP/sec healing.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>APEX ARENA v54.102 · PRODUCTION TECHNICAL BLUEPRINT</span>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg brawl-btn-yellow text-slate-950 font-brawl font-black"
          >
            CLOSE BLUEPRINT
          </button>
        </div>
      </div>
    </div>
  );
};
