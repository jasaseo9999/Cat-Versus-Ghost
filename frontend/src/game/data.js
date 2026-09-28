export const A = (n) => `/assets/${n}.webp`;

export const STAGE_W = 1280;
export const STAGE_H = 720;
export const ROWS = 5;
export const COLS = 9;
// Lawn grid position inside the 1280x720 stage
export const BOARD = { x: 200, y: 128, cw: 100.7, rh: 110.4 };
export const BG_LAYOUT = { left: -202, top: -238, width: 1517 };

export const SNACK_COST = 15;
export const START_LIVES = 3;

export const EVO_NAMES = ["Kitten", "Warrior", "Legendary"];
export const EVO_DMG = [1, 1.35, 1.8];
export const EVO_HP = [1, 1.3, 1.7];
export const EVO_XP = [4, 12];

export const CATS = {
  solar: {
    id: "solar", name: "Solar Cat", cost: 50, cooldown: 5, hp: 260, img: A("cat_solar"),
    role: "Penghasil Moonlight", color: "#fbbf24", produceDay: 14, produceNight: 10,
    desc: "Kucing oren yang tidur di bawah bulan sambil mengumpulkan cahaya. Menghasilkan Moonlight secara berkala, tidak bisa menyerang.",
  },
  claw: {
    id: "claw", name: "Claw Cat", cost: 75, cooldown: 6, hp: 420, dmg: 45, rate: 0.9, reach: 1.35, img: A("cat_claw"),
    role: "Petarung Jarak Dekat", color: "#f97316",
    desc: "Mencakar hantu dari dekat dengan damage tinggi. Lemah terhadap hantu terbang (damage 40%).",
  },
  bubble: {
    id: "bubble", name: "Bubble Cat", cost: 100, cooldown: 7, hp: 280, dmg: 20, rate: 1.4, slow: 3, img: A("cat_bubble"),
    role: "Support Pelambat", color: "#38bdf8",
    desc: "Menembakkan bola gelembung roh yang memperlambat hantu 50% selama 3 detik.",
  },
  laser: {
    id: "laser", name: "Laser Cat", cost: 150, cooldown: 9, hp: 280, dmg: 40, rate: 2.0, img: A("cat_laser"),
    role: "Sinar Satu Jalur", color: "#d946ef",
    desc: "Mata laser menembakkan sinar energi yang mengenai SEMUA hantu di satu jalur.",
  },
  ninja: {
    id: "ninja", name: "Ninja Cat", cost: 200, cooldown: 10, hp: 300, dmg: 22, rate: 1.3, pierce: 2, nightBoost: true,
    img: A("cat_ninja"), role: "Shuriken Multi Target", color: "#6366f1",
    desc: "Melempar 3 shuriken sekaligus (jalurnya + 2 jalur sebelah), masing-masing menembus 2 hantu. Lebih kuat di malam hari.",
  },
  hunter: {
    id: "hunter", name: "Ghost Hunter Cat", cost: 300, cooldown: 14, hp: 350, dmg: 45, rate: 1.5, bossMult: 3, nightBoost: true,
    img: A("cat_hunter"), role: "Anti Invisible & Boss", color: "#10b981",
    desc: "Bisa melihat hantu invisible (mengungkap jalurnya & 2 jalur sebelah) dan memberi damage x3 ke Boss. Lebih kuat di malam hari.",
  },
  samurai: {
    id: "samurai", name: "Samurai Cat", cost: 125, cooldown: 8, hp: 460, dmg: 50, rate: 1.1, reach: 1.6, img: A("col_samurai"),
    role: "Tebasan Area", color: "#ef4444", collection: true, unlock: 2,
    desc: "Tebasan katana mengenai SEMUA hantu dalam jarak 1.5 petak di jalurnya, termasuk hantu terbang.",
  },
  wizard: {
    id: "wizard", name: "Wizard Cat", cost: 175, cooldown: 10, hp: 280, dmg: 65, rate: 3.2, img: A("col_wizard"),
    role: "Sihir Bulan Global", color: "#8b5cf6", collection: true, unlock: 4,
    desc: "Menjatuhkan sihir bulan ke hantu terdepan di halaman (jalur mana pun): damage area 3 jalur + membekukan 1 detik.",
  },
  detective: {
    id: "detective", name: "Detective Cat", cost: 125, cooldown: 8, hp: 300, dmg: 16, rate: 1.2, markMult: 1.3, img: A("col_detective"),
    role: "Pengungkap Kelemahan", color: "#d97706", collection: true, unlock: 6,
    desc: "Hantu di jalurnya & 2 jalur sebelah menerima +30% damage dan hantu invisible terungkap. Menyorot hantu dengan kaca pembesar.",
  },
  vampire: {
    id: "vampire", name: "Vampire Cat", cost: 150, cooldown: 9, hp: 320, dmg: 30, rate: 1.0, range: 3.2, nightBoost: true, img: A("col_vampire"),
    role: "Penghisap Energi", color: "#be123c", collection: true, unlock: 8,
    desc: "Menghisap energi hantu dalam 3 petak untuk memulihkan dirinya & kucing sekitar. Tiap hantu yang ia kalahkan memberi +10 Moonlight.",
  },
  robot: {
    id: "robot", name: "Robot Cat", cost: 225, cooldown: 14, hp: 1400, dmg: 32, rate: 1.6, immune: true, img: A("col_robot"),
    role: "Tank Roket", color: "#14b8a6", collection: true, unlock: 11,
    desc: "HP sangat besar dan menembakkan roket. Tidak terpengaruh mood, kebal Possession maupun jeritan Kuntilanak.",
  },
};
export const CAT_ORDER = ["solar", "claw", "bubble", "laser", "ninja", "hunter"];
export const COLLECTION_ORDER = ["samurai", "wizard", "detective", "vampire", "robot"];
export const ALL_CATS = [...CAT_ORDER, ...COLLECTION_ORDER];
export const DECK_MAX = 8;

export const UPG_MAX = 3;
export const UPG_COST = [1, 2, 3];
export const UPG_DMG = 0.15;
export const UPG_HP = 0.12;
export const UPG_PROD = 0.12;
export const ENDLESS_STAR_WAVES = 5;
export const ENDLESS_STAR_MAX = 10;

export const GHOSTS = {
  basic: { id: "basic", name: "Basic Ghost", hp: 150, speed: 0.3, dmg: 20, biteRate: 1, points: 10, size: 102, img: A("ghost_basic"),
    desc: "Hantu biasa. HP rendah dan jalan lambat." },
  speed: { id: "speed", name: "Speed Ghost", hp: 100, speed: 0.72, dmg: 15, biteRate: 1, points: 15, size: 102, flying: true, img: A("ghost_speed"),
    desc: "Bergerak cepat, terbang, dan melompati kucing pertama yang menghalanginya." },
  shield: { id: "shield", name: "Shield Ghost", hp: 150, shield: 260, speed: 0.26, dmg: 20, biteRate: 1, points: 20, size: 108, img: A("ghost_shield"),
    desc: "Membawa perisai roh yang mengurangi 75% damage dari depan sampai perisai hancur." },
  doll: { id: "doll", name: "Hantu Boneka", hp: 300, speed: 0.25, dmg: 22, biteRate: 1, points: 25, size: 100, possessed: true, img: A("ghost_doll"),
    desc: "Boneka kerasukan. Saat HP di bawah 50% ia mengamuk dan berlari 2x lebih cepat." },
  tv: { id: "tv", name: "Hantu TV", hp: 380, speed: 0.2, dmg: 25, biteRate: 1.2, points: 30, size: 106, possessed: true, abilityEvery: 7, img: A("ghost_tv"),
    desc: "TV kerasukan. Memancarkan sinyal statis yang membuat kucing di depannya pingsan 2.5 detik." },
  lamp: { id: "lamp", name: "Hantu Lampu", hp: 200, speed: 0.32, dmg: 15, biteRate: 1, points: 25, size: 102, flying: true, possessed: true, abilityEvery: 4.5, img: A("ghost_lamp"),
    desc: "Lampu minyak kerasukan yang terbang. Api hijaunya menyembuhkan hantu di sekitarnya." },
  invisible: { id: "invisible", name: "Invisible Ghost", hp: 180, speed: 0.34, dmg: 20, biteRate: 1, points: 25, size: 102, invisible: true, img: A("ghost_invisible"),
    desc: "Tidak terlihat oleh kucing biasa. Harus dilawan (atau diungkap) oleh Ghost Hunter Cat." },
  mini: { id: "mini", name: "Hantu Kecil", hp: 60, speed: 0.45, dmg: 10, biteRate: 1, points: 5, size: 64, img: A("ghost_basic"),
    desc: "Hantu kecil yang dipanggil oleh Ghost Storm." },
  boss: { id: "boss", name: "King Phantom Catnapper", hp: 5200, speed: 0.07, dmg: 70, biteRate: 1, points: 1000, size: 280, img: A("boss_king"),
    desc: "Raja hantu yang ingin mengubah semua kucing menjadi roh. Skill: Ghost Storm, Possession, Dark Moon (dan Grave Rise di Kuburan Tua)." },
  pocong: { id: "pocong", name: "Pocong", hp: 280, speed: 1.5, hop: true, dmg: 22, biteRate: 1, points: 25, size: 104, grave: true, img: A("ghost_pocong"),
    desc: "Hantu khas kuburan yang melompat-lompat maju dengan cepat. Kain kafannya tebal (HP tinggi)." },
  tuyul: { id: "tuyul", name: "Tuyul", hp: 100, speed: 0.62, dmg: 10, biteRate: 0.8, points: 20, size: 78, grave: true, img: A("ghost_tuyul"),
    desc: "Si kecil pencuri! Setiap gigitannya mencuri 10 Moonlight, dan jika masuk rumah ia membawa kabur 50 Moonlight." },
  kuntilanak: { id: "kuntilanak", name: "Kuntilanak", hp: 240, speed: 0.3, dmg: 20, biteRate: 1, points: 30, size: 112, flying: true, flip: true, abilityEvery: 8, grave: true, img: A("ghost_kuntilanak"),
    desc: "Melayang dan menjerit setiap 8 detik: kucing di jalurnya ketakutan dan jadi mengantuk (mood turun drastis)." },
  nisan: { id: "nisan", name: "Hantu Nisan", hp: 650, speed: 0.15, dmg: 30, biteRate: 1.2, points: 35, size: 104, possessed: true, grave: true, img: A("ghost_nisan"),
    desc: "Batu nisan kerasukan yang sangat keras. Saat hancur, 2 hantu kecil keluar darinya." },
};
export const GHOST_ORDER = ["basic", "speed", "shield", "doll", "tv", "lamp", "invisible", "pocong", "tuyul", "kuntilanak", "nisan", "boss"];

export const BOSS_SKILLS = {
  storm: { name: "GHOST STORM!", desc: "Memanggil banyak hantu kecil" },
  possession: { name: "POSSESSION!", desc: "Mengambil alih kucing sementara" },
  darkmoon: { name: "DARK MOON!", desc: "Produksi Moonlight berhenti" },
  graverise: { name: "GRAVE RISE!", desc: "Membangkitkan Hantu Nisan dari tanah" },
};

export const COLLECTION = COLLECTION_ORDER.map((id) => CATS[id]);

export const LOCATIONS = [
  { id: 1, name: "Rumah Pinggir Kota", img: A("bg_yard_night"), bg: { night: A("bg_yard_night"), day: A("bg_yard_day") }, open: true },
  { id: 2, name: "Kuburan Tua", img: A("bg_grave_night"), bg: { night: A("bg_grave_night"), day: A("bg_grave_day") }, open: true, fog: true },
  { id: 3, name: "Rumah Angker", img: A("loc_haunted_house"), open: false },
  { id: 4, name: "Kastil Hantu", img: A("loc_castle"), open: false },
  { id: 5, name: "Dunia Roh", img: A("loc_spirit_world"), open: false },
];

const w = (ghosts, opts = {}) => ({ ghosts, ...opts });

export const LEVELS = [
  {
    num: 1, name: "Malam Pertama", cards: ["solar", "claw"], startMoon: 150, newCat: "claw", newGhost: "basic",
    tip: "Klik orb bulan untuk mengumpulkan Moonlight. Tanam Solar Cat dulu, lalu Claw Cat di depan!",
    waves: [w({ basic: 2 }), w({ basic: 4 }), w({ basic: 7 }, { night: true, big: true })],
  },
  {
    num: 2, name: "Si Cepat", cards: ["solar", "claw", "bubble"], startMoon: 150, newCat: "bubble", newGhost: "speed",
    tip: "Speed Ghost melompati kucing pertama. Bubble Cat bisa memperlambatnya!",
    waves: [w({ basic: 3 }), w({ basic: 3, speed: 2 }), w({ basic: 4, speed: 2 }, { night: true }), w({ basic: 6, speed: 4 }, { night: true, big: true })],
  },
  {
    num: 3, name: "Perisai Roh", cards: ["solar", "claw", "bubble", "laser"], startMoon: 175, newCat: "laser", newGhost: "shield",
    tip: "Laser Cat menembak seluruh jalur. Beri snack agar kucing tetap Happy (+20% damage)!",
    waves: [w({ basic: 4 }), w({ basic: 3, speed: 2, shield: 1 }), w({ basic: 4, shield: 3, speed: 2 }, { night: true }), w({ basic: 6, shield: 4, speed: 3 }, { night: true, big: true })],
  },
  {
    num: 4, name: "Benda Kerasukan", cards: ["solar", "claw", "bubble", "laser", "ninja"], startMoon: 200, newCat: "ninja", newGhost: "tv",
    tip: "Boneka, TV, dan Lampu kerasukan punya kemampuan unik. Ninja Cat menyerang 3 jalur sekaligus!",
    waves: [w({ basic: 4, doll: 1 }), w({ basic: 3, speed: 2, lamp: 2 }), w({ basic: 3, shield: 2, tv: 2, doll: 1 }, { night: true }), w({ basic: 6, shield: 3, doll: 2, tv: 2, lamp: 2 }, { night: true, big: true })],
  },
  {
    num: 5, name: "Tak Kasat Mata", cards: CAT_ORDER, startMoon: 225, newCat: "hunter", newGhost: "invisible",
    tip: "Invisible Ghost hanya bisa dilihat Ghost Hunter Cat. Tempatkan Hunter untuk mengungkap jalurnya!",
    waves: [w({ basic: 4, speed: 1 }), w({ basic: 3, invisible: 2, shield: 1 }), w({ basic: 4, invisible: 3, lamp: 2, doll: 1 }, { night: true }), w({ basic: 6, invisible: 4, shield: 3, tv: 2, speed: 3 }, { night: true, big: true })],
  },
  {
    num: 6, name: "Raja Hantu", cards: CAT_ORDER, startMoon: 300, newGhost: "boss", boss: true,
    tip: "King Phantom Catnapper datang! Hati-hati Ghost Storm, Possession (beri snack untuk membebaskan kucing) dan Dark Moon.",
    waves: [w({ basic: 5, speed: 2 }), w({ basic: 4, shield: 2, invisible: 2, doll: 1 }), w({ basic: 5, shield: 3, tv: 2, lamp: 2, speed: 2 }, { night: true }), w({ basic: 6, shield: 3, invisible: 2, doll: 2 }, { night: true, big: true, boss: true })],
  },
  {
    num: 7, loc: 2, name: "Gerbang Kuburan", cards: CAT_ORDER, startMoon: 200, newGhost: "pocong",
    tip: "Selamat datang di Kuburan Tua yang berkabut! Pocong melompat cepat — perlambat dengan Bubble Cat dan tahan dengan kucing ber-HP tinggi.",
    waves: [w({ basic: 4 }), w({ basic: 3, pocong: 2, speed: 1 }), w({ basic: 4, pocong: 3, shield: 2 }, { night: true }), w({ basic: 6, pocong: 4, shield: 2, speed: 2 }, { night: true, big: true })],
  },
  {
    num: 8, loc: 2, name: "Pencuri Cilik", cards: CAT_ORDER, startMoon: 200, newGhost: "tuyul",
    tip: "Tuyul mencuri Moonlight setiap kali menggigit! Kalahkan secepat mungkin sebelum tabunganmu habis.",
    waves: [w({ basic: 3, tuyul: 2 }), w({ basic: 3, tuyul: 3, pocong: 1 }), w({ basic: 2, tuyul: 4, pocong: 2, shield: 2 }, { night: true }), w({ basic: 5, tuyul: 5, pocong: 3, doll: 2 }, { night: true, big: true })],
  },
  {
    num: 9, loc: 2, name: "Jeritan Malam", cards: CAT_ORDER, startMoon: 225, newGhost: "kuntilanak",
    tip: "Jeritan Kuntilanak membuat kucing ketakutan dan mengantuk. Siapkan Snack untuk mengembalikan mood mereka!",
    waves: [w({ basic: 4, pocong: 1 }), w({ basic: 3, kuntilanak: 2, tuyul: 2 }), w({ basic: 2, kuntilanak: 3, pocong: 2, lamp: 2 }, { night: true }), w({ basic: 3, kuntilanak: 4, pocong: 3, tuyul: 3, shield: 3 }, { night: true, big: true })],
  },
  {
    num: 10, loc: 2, name: "Nisan Bergerak", cards: CAT_ORDER, startMoon: 250, newGhost: "nisan",
    tip: "Hantu Nisan sangat keras dan melepaskan 2 hantu kecil saat hancur. Laser & Ninja Cat sangat berguna di sini.",
    waves: [w({ basic: 4, nisan: 1 }), w({ basic: 2, nisan: 2, pocong: 2 }), w({ nisan: 2, kuntilanak: 2, tuyul: 2, shield: 2 }, { night: true }), w({ basic: 4, nisan: 4, pocong: 3, kuntilanak: 2, tv: 2 }, { night: true, big: true })],
  },
  {
    num: 11, loc: 2, name: "Kabut Tebal", cards: CAT_ORDER, startMoon: 250, newGhost: "invisible",
    tip: "Kabut menyembunyikan banyak Invisible Ghost. Ghost Hunter atau Detective Cat wajib dibawa!",
    waves: [w({ basic: 4, invisible: 2 }), w({ invisible: 3, pocong: 2, tuyul: 2 }), w({ invisible: 3, kuntilanak: 2, nisan: 2, lamp: 2 }, { night: true }), w({ basic: 4, invisible: 4, pocong: 3, nisan: 2, kuntilanak: 3, tuyul: 3 }, { night: true, big: true })],
  },
  {
    num: 12, loc: 2, name: "Raja Kembali", cards: CAT_ORDER, startMoon: 325, newGhost: "boss", boss: true, bossHp: 1.5,
    bossSkills: ["storm", "graverise", "possession", "darkmoon"],
    tip: "King Phantom Catnapper kembali lebih kuat! Skill baru GRAVE RISE membangkitkan Hantu Nisan. Bawa pasukan terbaikmu.",
    waves: [w({ basic: 5, pocong: 2 }), w({ tuyul: 3, kuntilanak: 2, shield: 2, basic: 2 }), w({ nisan: 2, invisible: 2, pocong: 3, lamp: 2 }, { night: true }), w({ basic: 6, pocong: 3, kuntilanak: 2, invisible: 2 }, { night: true, big: true, boss: true })],
  },
].map((l) => ({ loc: 1, ...l }));

export const getLevel = (num) => LEVELS.find((l) => l.num === Number(num));
export const levelLabel = (l) => `${l.loc}-${l.num - (l.loc - 1) * 6}`;
export const getLocation = (id) => LOCATIONS.find((l) => l.id === id);
