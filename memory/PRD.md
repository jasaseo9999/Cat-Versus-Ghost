# Cat Versus Ghost — PRD

## Original Problem Statement
Buatkan game "Cat Versus Ghost" (Tower Defense / Lane Defense / Strategy Casual). Malam bulan purnama, hantu mencuri energi kehidupan; kucing penjaga malam mengusir mereka. Pemain mengumpulkan Moonlight, memanggil kucing, menempatkan di jalur, mengalahkan gelombang hantu, bertahan sampai boss. Kucing: Solar, Claw, Laser, Bubble, Ninja, Ghost Hunter. Hantu: Basic, Speed, Shield, Possessed Object (boneka/TV/lampu), Invisible. Boss King Phantom Catnapper (Ghost Storm, Possession, Dark Moon). Mode: Story (30 level, 5 lokasi), Endless Night, Cat Collection (Samurai, Wizard, Vampire, Robot, Detective). Fitur unik: Mood kucing, Siang & Malam, Evolusi kucing. Buatkan asset-assetnya juga.

## User Choices
- MVP: core gameplay + few levels + boss (other features later)
- AI-generated cartoon assets (like reference image)
- No login: localStorage progress + global leaderboard on server
- Desktop + mobile (landscape), simple Web Audio SFX, Indonesian UI

## Architecture
- Frontend: React (CRA/craco), DOM-rendered game on fixed 1280x720 stage scaled to viewport. `src/game/` (data, engine, audio, storage), `src/components/game/` (Stage, Board, Units, Hud, CardDeck, GameModals), pages (MainMenu, LevelSelect, GamePage, Almanac, Leaderboard).
- Backend: FastAPI + MongoDB `scores` collection. `POST /api/scores`, `GET /api/scores?limit=`.
- Assets: 30 AI-generated images (Gemini) background-removed with rembg → `/app/frontend/public/assets/*.webp`.

## Implemented (2026-06)
- Full lane-defense engine: 5x9 grid, Moonlight orbs (sky + Solar Cat), 6 cats with unique attacks, 8 ghost types incl. possessed doll (enrage), TV (stun), lamp (heal), invisible (revealed by Hunter), speed (leaps first cat), shield (absorbs damage)
- Boss King Phantom Catnapper with Ghost Storm / Possession / Dark Moon + boss HP bar
- Mood system (Happy/Angry/Sleepy/Possessed) + Snack tool, Shovel tool
- Day/Night phases (day ghosts weaker & fewer orbs; night stronger Ninja/Hunter, day/night backgrounds crossfade)
- In-battle evolution Kitten → Warrior → Legendary
- Story: Location 1 "Rumah Pinggir Kota" 6 levels (L6 boss), stars = remaining lives, unlock progression; locations 2–5 shown "Segera Hadir"
- Endless Night with scaling waves, boss every 8 waves, score + global leaderboard submission
- Almanac (cats, ghosts, collection preview, rules), pause, 2x speed, mute, keyboard shortcuts, rotate-device hint
- Debug hook `?debug=1` → `window.__cvg`

## Backlog
- P1: Locations 2–5 (Kuburan Tua, Rumah Angker, Kastil Hantu, Dunia Roh) → 30 levels total with new backgrounds
- P1: Cat Collection unlocks (Samurai, Wizard, Vampire, Robot, Detective) as playable cats
- P2: Persistent evolution/upgrade between levels, background music, drag-and-drop placement, tutorial overlay
