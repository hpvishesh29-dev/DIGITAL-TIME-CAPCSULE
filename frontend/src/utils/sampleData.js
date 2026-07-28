// Sample Photorealistic Memory Data for CHRONA Digital Time Capsule
//
// NOTE: INITIAL_MEMORIES is intentionally kept EMPTY, same as before — real
// users should start from a blank vault. SAMPLE_MEMORIES below is a new,
// richly-populated export meant for demo mode / onboarding previews / the
// "Time Keeper" demo account, so it never has to be wired into a real
// user's data by accident.

// ──────────────────────────────────────────────────────────────────────────
// Categories
// ──────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  'Milestone',
  'Travel',
  'Family',
  'Friendship',
  'Achievement',
  'Reflection',
  'Celebration',
  'Adventure',
  'Career',
  'Nature'
];

// ──────────────────────────────────────────────────────────────────────────
// Randomization helpers
// ──────────────────────────────────────────────────────────────────────────

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;
const pickRandom = (arr) => arr[randomInt(0, arr.length - 1)];

/**
 * Distributes `total` points evenly across a sphere of `radius` using a
 * golden-angle spiral (Fibonacci sphere), then nudges each point with a
 * small random jitter so the vault doesn't look mechanically uniform.
 * Returns { x, y, z } suitable for placing capsules in the 3D scene.
 */
export const generateOrbitPosition = (index, total, radius = 6) => {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / Math.max(total - 1, 1)) * 2; // -1..1
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = goldenAngle * index;

  const jitter = () => randomFloat(-0.15, 0.15);

  return {
    x: Number((Math.cos(theta) * radiusAtY * radius + jitter()).toFixed(3)),
    y: Number((y * radius + jitter()).toFixed(3)),
    z: Number((Math.sin(theta) * radiusAtY * radius + jitter()).toFixed(3))
  };
};

/** Random unlock date between `minDays` and `maxDays` from now. */
const randomUnlockDate = (minDays = 7, maxDays = 730) => {
  const days = randomInt(minDays, maxDays);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

/** Random creation date between `minDaysAgo` and `maxDaysAgo` in the past. */
const randomPastDate = (minDaysAgo = 1, maxDaysAgo = 900) => {
  const days = randomInt(minDaysAgo, maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// ──────────────────────────────────────────────────────────────────────────
// Preset photos — used as capsule cover art and in the photo picker
// ──────────────────────────────────────────────────────────────────────────

export const PRESET_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
    name: "Nebula Odyssey",
    tag: "Cosmic"
  },
  {
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
    name: "Emerald Forest Mist",
    tag: "Nature"
  },
  {
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=80",
    name: "Metropolis Glow",
    tag: "Urban"
  },
  {
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80",
    name: "Deep Ocean Ridge",
    tag: "Discovery"
  },
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    name: "Yosemite Sunset",
    tag: "Landscape"
  },
  {
    url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1000&q=80",
    name: "Alpine Trailhead",
    tag: "Adventure"
  },
  {
    url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1000&q=80",
    name: "Golden Hour Skyline",
    tag: "Urban"
  },
  {
    url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1000&q=80",
    name: "Milky Way Overlook",
    tag: "Cosmic"
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80",
    name: "Foggy Pine Ridge",
    tag: "Nature"
  },
  {
    url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80",
    name: "Coastal Cliffs at Dawn",
    tag: "Landscape"
  }
];

// ──────────────────────────────────────────────────────────────────────────
// Real user data starts empty — unchanged behavior
// ──────────────────────────────────────────────────────────────────────────

export const INITIAL_MEMORIES = [];

// ──────────────────────────────────────────────────────────────────────────
// Sample / demo memory capsules
// ──────────────────────────────────────────────────────────────────────────

const RAW_SAMPLE_MEMORIES = [
  {
    title: "The Night We Camped Under the Milky Way",
    caption: "No signal, no plans, just the four of us and more stars than we'd ever seen at once.",
    location: { name: "Joshua Tree, California, USA", lat: 33.8734, lng: -115.9010 },
    category: "Adventure",
    aiStory:
      "Somewhere between the third pot of instant coffee and the meteor that made everyone gasp at once, this trip stopped being a weekend getaway and became the story you'd tell for years. The desert has a way of making time feel optional — you'll remember this night long after you've forgotten what day it happened on.",
    photo: PRESET_PHOTOS[7],
    daysAgo: 214,
    unlockInDays: 151
  },
  {
    title: "Grandma's Kitchen, One Last Sunday",
    caption: "She taught me the dumpling fold for the hundredth time, insisting I still wasn't doing it right.",
    location: { name: "Chengdu, Sichuan, China", lat: 30.5728, lng: 104.0668 },
    category: "Family",
    aiStory:
      "Some memories aren't about what happened, but about who was in the room. Flour on the counter, the radio playing something neither of you were really listening to, and a recipe that was never really about the food. Capsules like this one are the reason we built a place to keep them.",
    photo: PRESET_PHOTOS[1],
    daysAgo: 402,
    unlockInDays: 30
  },
  {
    title: "The Offer Letter Arrived at 11:47 PM",
    caption: "Three years of night classes, and it finally came down to one email I refreshed forty times.",
    location: { name: "Austin, Texas, USA", lat: 30.2672, lng: -97.7431 },
    category: "Career",
    aiStory:
      "You'll want to remember exactly how this felt — not the job title, not the salary, but the specific kind of disbelief that comes after years of quietly betting on yourself. Whoever you are when you open this again, you made it here because you didn't stop.",
    photo: PRESET_PHOTOS[6],
    daysAgo: 88,
    unlockInDays: 277
  },
  {
    title: "Getting Lost in Kyoto on Purpose",
    caption: "We put the map away after the third temple and just followed whichever alley looked interesting.",
    location: { name: "Kyoto, Japan", lat: 35.0116, lng: 135.7681 },
    category: "Travel",
    aiStory:
      "The best part of the trip wasn't on the itinerary. It was the tiny izakaya with no English menu, the old woman who insisted on showing you the shortcut through the shrine grounds, and the realization that being lost was, for once, the entire point.",
    photo: PRESET_PHOTOS[4],
    daysAgo: 512,
    unlockInDays: 45
  },
  {
    title: "First Steps in the Living Room",
    caption: "Seven wobbly steps from the couch to my hands, and then straight into the dog's water bowl.",
    location: { name: "Portland, Oregon, USA", lat: 45.5152, lng: -122.6784 },
    category: "Milestone",
    aiStory:
      "There's no footage of the moment you first walked on your own — just this. A living room, a golden retriever who saw it coming before we did, and a memory we couldn't wait to seal away for the day you're old enough to laugh about it.",
    photo: PRESET_PHOTOS[9],
    daysAgo: 940,
    unlockInDays: 3650
  },
  {
    title: "The Wedding Toast I Almost Didn't Give",
    caption: "I rewrote it four times in the bathroom and still cried through the second paragraph.",
    location: { name: "Lake Como, Italy", lat: 45.9860, lng: 9.2572 },
    category: "Celebration",
    aiStory:
      "Nerves aside, this was one of those nights where every table felt like it was glowing. Somewhere between the toast and the last slow dance, everyone stopped checking their phones. That's usually how you know a night was worth keeping.",
    photo: PRESET_PHOTOS[4],
    daysAgo: 630,
    unlockInDays: 15
  },
  {
    title: "Finishing the Marathon I Almost Quit",
    caption: "Mile 21 nearly broke me, but a stranger handed me an orange slice and told me to keep going.",
    location: { name: "Boston, Massachusetts, USA", lat: 42.3601, lng: -71.0589 },
    category: "Achievement",
    aiStory:
      "Training logs don't capture the moment your legs stop listening to you, or the stranger-turned-friend who paced beside you for the last two miles just because you looked like you needed it. This capsule is proof you finished what you almost didn't start.",
    photo: PRESET_PHOTOS[5],
    daysAgo: 176,
    unlockInDays: 90
  },
  {
    title: "The Summer We Rebuilt the Treehouse",
    caption: "Dad measured twice and cut once, and I still don't think either board was level.",
    location: { name: "Asheville, North Carolina, USA", lat: 35.5951, lng: -82.5515 },
    category: "Family",
    aiStory:
      "It took three weekends longer than planned and cost twice the budget, but nobody actually cared. What you'll remember isn't the crooked railing — it's the radio on the porch, the lemonade breaks, and a project that was never really about the treehouse.",
    photo: PRESET_PHOTOS[2],
    daysAgo: 760,
    unlockInDays: 200
  },
  {
    title: "Diving the Reef Before It Changes",
    caption: "The guide said this coral bed might not look like this in ten years. We stayed down until the tanks ran low.",
    location: { name: "Great Barrier Reef, Queensland, Australia", lat: -18.2871, lng: 147.6992 },
    category: "Nature",
    aiStory:
      "There's a quiet urgency to diving somewhere fragile — you notice colors differently, linger a little longer at every turn. This capsule is a small act of remembering the reef exactly as it was on this one ordinary, extraordinary Tuesday.",
    photo: PRESET_PHOTOS[3],
    daysAgo: 320,
    unlockInDays: 500
  },
  {
    title: "Ten Years of the Same Coffee Order",
    caption: "He still asks 'the usual?' even though I haven't changed my order since college.",
    location: { name: "Brooklyn, New York, USA", lat: 40.6782, lng: -73.9442 },
    category: "Friendship",
    aiStory:
      "Not every memory needs a milestone to earn its place here. Sometimes it's just a decade of Tuesday mornings, a barista who became a friend, and the quiet comfort of a place that never really changes while everything else does.",
    photo: PRESET_PHOTOS[6],
    daysAgo: 60,
    unlockInDays: 365
  },
  {
    title: "The Letter I Wrote Myself After the Diagnosis",
    caption: "I didn't know what to say, so I just wrote the truth and sealed it before I could talk myself out of it.",
    location: { name: "Denver, Colorado, USA", lat: 39.7392, lng: -104.9903 },
    category: "Reflection",
    aiStory:
      "Some capsules aren't for looking back fondly — they're for the version of you who needs to hear that this moment, however hard, was survived. Whatever this year has looked like since, you're still here to open it.",
    photo: PRESET_PHOTOS[8],
    daysAgo: 495,
    unlockInDays: 550
  },
  {
    title: "The Northern Lights We Almost Missed",
    caption: "We'd already given up and gone back inside when the sky turned green through the cabin window.",
    location: { name: "Tromsø, Norway", lat: 69.6492, lng: 18.9553 },
    category: "Travel",
    aiStory:
      "Four cold nights of clouds, and then — with bags half-packed for the flight home — the sky finally opened up. It lasted maybe eleven minutes. This capsule exists because eleven minutes was enough to make the whole trip worth it.",
    photo: PRESET_PHOTOS[0],
    daysAgo: 148,
    unlockInDays: 120
  }
];

/**
 * Fully-formed sample memory capsules for demo mode. Each includes a stable
 * id, absolute ISO dates, a lock/unlock state derived from those dates, and
 * an evenly-distributed 3D orbit position for the scene.
 */
export const SAMPLE_MEMORIES = RAW_SAMPLE_MEMORIES.map((memory, index) => {
  const createdDate = randomPastDate(memory.daysAgo, memory.daysAgo);
  const unlockDate = randomUnlockDate(memory.unlockInDays, memory.unlockInDays);
  const isLocked = new Date(unlockDate).getTime() > Date.now();

  return {
    id: `sample-capsule-${index + 1}`,
    title: memory.title,
    caption: memory.caption,
    location: memory.location,
    category: memory.category,
    aiStory: memory.aiStory,
    photo: memory.photo,
    createdDate,
    unlockDate,
    isLocked,
    orbitPosition: generateOrbitPosition(index, RAW_SAMPLE_MEMORIES.length)
  };
});

// ──────────────────────────────────────────────────────────────────────────
// Capsule generator — for previews, onboarding, and "surprise me" flows
// ──────────────────────────────────────────────────────────────────────────

const FALLBACK_TITLES = [
  "A Moment Worth Keeping",
  "Something I Don't Want to Forget",
  "The Day Everything Changed a Little",
  "A Small, Perfect Afternoon"
];

const FALLBACK_LOCATIONS = [
  { name: "Reykjavík, Iceland", lat: 64.1466, lng: -21.9426 },
  { name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241 },
  { name: "Vancouver, Canada", lat: 49.2827, lng: -123.1207 },
  { name: "Marrakesh, Morocco", lat: 31.6295, lng: -7.9811 }
];

/**
 * Generates a single randomized, plausible-looking memory capsule. Useful
 * for populating empty states, onboarding previews, or a "generate a
 * sample capsule" button in CreateCapsuleModal.
 */
export const generateRandomCapsule = (index = 0, total = 1) => ({
  id: `generated-capsule-${Date.now()}-${index}`,
  title: pickRandom(FALLBACK_TITLES),
  caption: "Filled with a memory yet to be written.",
  location: pickRandom(FALLBACK_LOCATIONS),
  category: pickRandom(CATEGORIES),
  aiStory: "This capsule is still waiting for its story. Add a memory to bring it to life.",
  photo: pickRandom(PRESET_PHOTOS),
  createdDate: new Date().toISOString(),
  unlockDate: randomUnlockDate(),
  isLocked: true,
  orbitPosition: generateOrbitPosition(index, Math.max(total, 1))
});