export type SeedSkin = {
  name: string;
  weapon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "arcane" | "nameless";
  price: number;
};

// Приблизительные рыночные цены в голде (G)
export const SEED_SKINS: SeedSkin[] = [
  // ---------- Ножи ----------
  { name: "GOLD", weapon: "Karambit", rarity: "nameless", price: 95000 },
  { name: "Harmony", weapon: "Dual Daggers", rarity: "nameless", price: 62000 },
  { name: "Dragon Glass", weapon: "M9 Bayonet", rarity: "arcane", price: 37000 },
  { name: "Universe", weapon: "M9 Bayonet", rarity: "arcane", price: 19500 },
  { name: "Scratch", weapon: "M9 Bayonet", rarity: "arcane", price: 16000 },
  { name: "Blue Blood", weapon: "M9 Bayonet", rarity: "arcane", price: 9800 },
  { name: "Frozen", weapon: "M9 Bayonet", rarity: "arcane", price: 9000 },
  { name: "Claw", weapon: "Karambit", rarity: "arcane", price: 6900 },
  { name: "Kumo", weapon: "M9 Bayonet", rarity: "arcane", price: 6300 },
  { name: "Digital Burst", weapon: "M9 Bayonet", rarity: "arcane", price: 5400 },
  { name: "Dragon Glass", weapon: "Karambit", rarity: "arcane", price: 3450 },
  { name: "Widow's Weave", weapon: "Karambit", rarity: "legendary", price: 1450 },
  { name: "Doppler", weapon: "Butterfly", rarity: "arcane", price: 4300 },
  { name: "Glitch", weapon: "Butterfly", rarity: "legendary", price: 2100 },
  { name: "Legacy", weapon: "Butterfly", rarity: "legendary", price: 1900 },
  { name: "Pearl Abyss", weapon: "Tanto", rarity: "legendary", price: 1700 },
  { name: "Divine Power", weapon: "Kukri", rarity: "legendary", price: 1250 },
  { name: "Ice Storm", weapon: "Fang", rarity: "legendary", price: 780 },
  { name: "Damascus", weapon: "Fang", rarity: "epic", price: 640 },
  { name: "Eclipse", weapon: "Mantis", rarity: "arcane", price: 1150 },
  { name: "Nest", weapon: "Mantis", rarity: "legendary", price: 1320 },
  { name: "Jaw", weapon: "Dual Daggers", rarity: "nameless", price: 15400 },
  { name: "Retro Arcade", weapon: "Dual Daggers", rarity: "rare", price: 650 },
  { name: "Magnalium", weapon: "Flip", rarity: "rare", price: 710 },
  { name: "Veil", weapon: "Scorpion", rarity: "rare", price: 625 },
  { name: "Magnalium", weapon: "Scorpion", rarity: "rare", price: 635 },
  { name: "Shroud", weapon: "Stick", rarity: "legendary", price: 980 },
  { name: "Slaughter", weapon: "Bayonet", rarity: "epic", price: 870 },
  { name: "Marble Fade", weapon: "Bayonet", rarity: "arcane", price: 4100 },

  // ---------- AKR ----------
  { name: "Treasure Hunter", weapon: "AKR", rarity: "arcane", price: 6200 },
  { name: "Necromancer", weapon: "AKR", rarity: "arcane", price: 2450 },
  { name: "Carbon", weapon: "AKR", rarity: "legendary", price: 1800 },
  { name: "Dragon", weapon: "AKR", rarity: "legendary", price: 900 },
  { name: "Two Years Red", weapon: "AKR", rarity: "arcane", price: 8300 },
  { name: "Reis", weapon: "AKR", rarity: "legendary", price: 3900 },
  { name: "Carving", weapon: "AKR-12", rarity: "epic", price: 420 },
  { name: "Wasteland", weapon: "AKR", rarity: "epic", price: 260 },
  { name: "Neon Rider", weapon: "AKR", rarity: "epic", price: 310 },

  // ---------- M4 / M4A1 ----------
  { name: "FLOCK", weapon: "M4", rarity: "nameless", price: 42000 },
  { name: "Sparkling Gaze", weapon: "M4A1", rarity: "arcane", price: 2600 },
  { name: "Bubblegum", weapon: "M4A1", rarity: "legendary", price: 1280 },
  { name: "Mermaid", weapon: "M4A1", rarity: "legendary", price: 1100 },
  { name: "Samurai", weapon: "M4", rarity: "epic", price: 580 },
  { name: "Minotaur", weapon: "M4", rarity: "rare", price: 190 },
  { name: "Golden Age", weapon: "M4A1", rarity: "legendary", price: 1550 },
  { name: "Cyber Bee", weapon: "M4A1", rarity: "epic", price: 340 },

  // ---------- AWM ----------
  { name: "Nebula", weapon: "AWM", rarity: "arcane", price: 5600 },
  { name: "Genesis", weapon: "AWM", rarity: "arcane", price: 4000 },
  { name: "Vampire", weapon: "AWM", rarity: "legendary", price: 1330 },
  { name: "Winter Sport", weapon: "AWM", rarity: "legendary", price: 1600 },
  { name: "Stickerbomb", weapon: "AWM", rarity: "epic", price: 350 },
  { name: "BOOM", weapon: "AWM", rarity: "epic", price: 260 },
  { name: "Poseidon", weapon: "AWM", rarity: "epic", price: 480 },
  { name: "Sport", weapon: "AWM", rarity: "legendary", price: 2200 },

  // ---------- Пистолеты ----------
  { name: "Dragon Glass", weapon: "Desert Eagle", rarity: "arcane", price: 3450 },
  { name: "Golden Rose", weapon: "USP", rarity: "legendary", price: 720 },
  { name: "Neon Rider", weapon: "USP", rarity: "epic", price: 240 },
  { name: "Phoenix", weapon: "P350", rarity: "legendary", price: 660 },
  { name: "Chameleon", weapon: "P350", rarity: "epic", price: 210 },
  { name: "Graffity", weapon: "MP7", rarity: "legendary", price: 380 },
  { name: "Fatal Combo", weapon: "Mac10", rarity: "legendary", price: 540 },
  { name: "Cobalt", weapon: "Glock", rarity: "rare", price: 120 },
  { name: "Flock", weapon: "Glock", rarity: "nameless", price: 88000 },

  // ---------- Прочее оружие ----------
  { name: "Grunge", weapon: "M60", rarity: "epic", price: 300 },
  { name: "Raider", weapon: "SPAS", rarity: "epic", price: 280 },
  { name: "Basilisk", weapon: "FN FAL", rarity: "epic", price: 330 },
  { name: "Muraena", weapon: "M16", rarity: "legendary", price: 690 },
  { name: "Hercules", weapon: "FabM", rarity: "rare", price: 150 },
  { name: "Toxic", weapon: "MP5", rarity: "rare", price: 95 },
  { name: "Sandstorm", weapon: "UMP", rarity: "common", price: 55 },
  { name: "Urban", weapon: "M110", rarity: "uncommon", price: 80 },
  { name: "Blizzard", weapon: "SCAR", rarity: "epic", price: 270 },
  { name: "Molten", weapon: "SCAR", rarity: "rare", price: 130 },
];

export const RARITY_COLORS: Record<string, { from: string; to: string; border: string; label: string }> = {
  common: { from: "#94a3b8", to: "#111827", border: "#94a3b8", label: "Обычный" },
  uncommon: { from: "#38bdf8", to: "#082f49", border: "#38bdf8", label: "Необычный" },
  rare: { from: "#60a5fa", to: "#111c4d", border: "#60a5fa", label: "Редкий" },
  epic: { from: "#a78bfa", to: "#2e1065", border: "#a78bfa", label: "Эпический" },
  legendary: { from: "#f472b6", to: "#4a0b2c", border: "#f472b6", label: "Легендарный" },
  arcane: { from: "#fb7185", to: "#4c0519", border: "#fb7185", label: "Аркана" },
  nameless: { from: "#fbbf24", to: "#451a03", border: "#fbbf24", label: "Безымянный" },
};

export function slugify(weapon: string, name: string) {
  return `${weapon}-${name}`
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
