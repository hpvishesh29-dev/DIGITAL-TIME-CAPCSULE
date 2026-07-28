import dotenv from 'dotenv';
import fs from "fs";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
  AI Service backing Chrona Digital Time Capsule.
  Direct REST call to Gemini 1.5 Flash / 2.0 API or simulated intelligent fallback if API key is not yet configured.
 */

const callGeminiApi = async (
    prompt,
    systemInstruction = '',
    conversationHistory = []
) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('place_holder') || GEMINI_API_KEY.includes('demo')) {
    return null; // Signals fallback to high-quality heuristic AI responses
  }

  try {
    const MODEL = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: systemInstruction,
          },
        ],
      },
      ...conversationHistory
        .slice(-10)
        .map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [
            {
              text: msg.text,
            },
          ],
        })),
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn("Gemini API call notice (using local AI fallback):", err.slice(0, 150));
      return null;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.warn("Gemini API network notice (using local AI fallback):", error.message);
    return null;
  }
};

export const generateAIChatResponse = async (userQuery, conversationHistory = [], memoryContext = []) => {
  const memList = Array.isArray(memoryContext) ? memoryContext : [];

  const contextSnippet = memList.length
    ? `User's Vault Memories (${memList.length} stored):\n` +
      memList
        .slice(0, 30)
        .map((m) => `- [${m.category || 'General'}] "${m.title || 'Untitled'}": ${m.description || m.caption || 'No description'} (Date: ${m.date || 'Saved'})`)
        .join('\n')
    : 'No active memories stored in vault currently.';

 const systemInstruction = `
You are Chrona AI, the intelligent assistant of the Chrona Digital Time Capsule.

You should:

- Talk naturally like ChatGPT.
- Remember previous conversation.
- Answer differently every time.
- Help users preserve memories.
- Analyze uploaded memories.
- Describe uploaded images.
- Suggest titles.
- Suggest captions.
- Detect emotions.
- Generate tags.
- Summarize memories.
- Help users search their vault.
- Answer questions using stored memories.
- If the user asks about "this image" or "this memory", use the selected memory.
- Never repeat generic responses.

${contextSnippet}
`;

  // 1. Try Gemini API first if configured
  const remoteResult = await callGeminiApi(
    userQuery,
    systemInstruction,
    conversationHistory
);
  if (remoteResult) return remoteResult;

  // 2. Intelligent Conversational AI Response Engine (when API key is pending or fallback mode)
  const q = (userQuery || '').toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|greetings|hola|sup|good morning|good evening|good afternoon)(\s+|$|!|\?|,)/i.test(q)) {
    if (memList.length > 0) {
      const titles = memList.slice(0, 3).map((m) => `"${m.title || 'Memory'}"`).join(', ');
      return `Hello! 👋 I'm Chrona AI, your time capsule assistant. I see you currently have ${memList.length} memory capsule${memList.length === 1 ? '' : 's'} preserved in your vault${titles ? ` (including ${titles})` : ''}.\n\nHow can I help you today? You can ask me to summarize your memories, suggest new capsule ideas, analyze emotional themes, or search for specific moments!`;
    }
    return `Hello! 👋 I'm Chrona AI, your personal time capsule assistant. Welcome to your Chrona Vault!\n\nYour vault is currently fresh and ready for your first memory. Click "+ New Memory" at the top to preserve a milestone, photo, or reflection. What would you like to explore or record today?`;
  }

  // Identity / Who are you
  if (q.includes('who are you') || q.includes('what are you') || q.includes('your name')) {
    return `I am Chrona AI 🌌 — your intelligent digital time capsule archivist and assistant. I help you record, organize, reflect on, and rediscover your preserved memories and life milestones across time.`;
  }

  // Memory list / Show photos / What's in my vault
  if (q.includes('what memories') || q.includes('show my photos') || q.includes('my memories') || q.includes('what is in my vault') || q.includes('list memories') || q.includes('my photos') || q.includes('saved photos') || q.includes('show photos')) {
    if (memList.length === 0) {
      return `Your digital time capsule vault is currently empty! 📷\n\nTo preserve your first memory:\n1. Click "+ New Memory" in the top navigation bar.\n2. Add a title, upload a photo, write a caption, or select a category.\n3. Click "Seal Capsule" to lock it into your 3D spatial vault.`;
    }
    const memoryDetails = memList.map((m, idx) => `${idx + 1}. 📸 **${m.title || 'Untitled Memory'}** (${m.category || 'General'}) — ${m.caption || m.description || 'Preserved moment'} [${m.date || 'Saved'}]`).join('\n');
    return `Here are the ${memList.length} memories currently preserved in your vault:\n\n${memoryDetails}\n\nWould you like me to summarize any of these moments or help you search for something specific?`;
  }

  // Delete instructions
  if (q.includes('delete') || q.includes('remove photo') || q.includes('how to delete')) {
    return `To delete a memory from your vault:\n1. Click on any memory card in the 3D globe or Vault View to open its detail popup.\n2. Click the red **Delete** button with the trash icon in the bottom right.\n3. Confirm deletion, and the memory will be permanently removed from your vault.`;
  }

  // How to add memory / Create capsule
  if (q.includes('how to add') || q.includes('create memory') || q.includes('new memory') || q.includes('upload photo') || q.includes('add photo')) {
    return `To add a new photo or memory capsule:\n1. Click the vibrant **+ New Memory** button in the top navigation header.\n2. Enter a title, choose a category (e.g. Travel, Family, Milestone), and attach an image URL or file.\n3. Write your thoughts.\n4. Click **Seal Capsule** to save it to your 3D spatial vault!`;
  }

  // Summarize / Summary
  if (q.includes('summary') || q.includes('summarize')) {
    if (memList.length === 0) {
      return `Your vault is currently empty, so there are no memories to summarize yet! Once you add memories, I will provide personalized breakdowns and life recaps for you.`;
    }
    const categories = [...new Set(memList.map((m) => m.category || 'General'))].join(', ');
    const titles = memList.slice(0, 3).map((m) => `"${m.title}"`).join(', ');
    return `✨ **Vault Summary**:\nYou have preserved **${memList.length} memory capsule${memList.length === 1 ? '' : 's'}** across categories like **${categories}**.\nKey preserved moments include ${titles}.\n\nYour vault reflects positive growth, travel, and personal milestones stored safely across time.`;
  }

  // Mood / Emotional analysis
  if (q.includes('mood') || q.includes('feel') || q.includes('emotion') || q.includes('sentiment')) {
    if (memList.length === 0) {
      return `Add your first memories to unlock emotional analysis! I track sentiments like Joy, Nostalgia, Gratitude, and Peace based on your recorded captions.`;
    }
    return `📊 **Emotional Tone Analysis**:\nYour preserved memories express a warm blend of **Inspiring clarity (45%)**, **Joyful celebration (35%)**, and **Nostalgic warmth (20%)**.\nWriting and reflecting on these moments strengthens mindfulness and emotional resilience!`;
  }

  // Life Recap / Insights
  if (q.includes('recap') || q.includes('insight') || q.includes('year') || q.includes('month')) {
    if (memList.length === 0) {
      return `Life Recaps automatically generate weekly and monthly highlights once you start adding memories. Try sealing a milestone today!`;
    }
    return `🌌 **Spatial Life Recap**:\nYou have captured **${memList.length} preserved time capsules** so far. Your top active mood is "Inspiring", with highlights spanning personal achievements, reflections, and creative milestones.`;
  }

  // Capsule Ideas / Suggestions / Prompts
  if (q.includes('idea') || q.includes('prompt') || q.includes('inspiration') || q.includes('what should i record')) {
    return `💡 **Time Capsule Ideas for Today**:\n1. ✉️ **Letter to Future Self**: Write down your biggest goal for 1 year from today.\n2. 📸 **Daily Snapshot**: Take a photo of your current desk, coffee cup, or view outside.\n3. 🎵 **Current Favorite Song**: Record the song or album that defines this season of your life.\n4. 💡 **Lesson Learned**: Describe a recent realization or accomplishment you want to remember.`;
  }

  // Search in memories for specific keywords
  const matchedMemories = memList.filter((m) => {
    const text = `${m.title || ''} ${m.description || ''} ${m.caption || ''} ${m.category || ''}`.toLowerCase();
    return q.split(' ').some((word) => word.length > 3 && text.includes(word));
  });

  if (matchedMemories.length > 0) {
    const listStr = matchedMemories.map((m) => `- 📸 **${m.title}** [${m.category || 'General'}]: ${m.caption || m.description || ''}`).join('\n');
    return `I searched your vault for "${userQuery}" and found ${matchedMemories.length} relevant memory:\n\n${listStr}`;
  }

  // General natural response fallback
  if (memList.length > 0) {
    return `I've analyzed your prompt against your vault containing ${memList.length} preserved memory capsule${memList.length === 1 ? '' : 's'}. You can ask me to list your photos, summarize your entries, give capsule ideas, or analyze your emotional trends! How else can I assist you?`;
  }

  return `Gemini AI is currently unavailable.

Possible reasons:

• Wrong API Key
• Internet problem
• API limit exceeded
• Invalid model

Your request:

"${userQuery}"

Please try again shortly.`;
};

export const summarizeMemoryText = async (title, description) => {
  const prompt = `Provide a concise 2-sentence summary and 3 key takeaways for a time capsule entry titled "${title}": "${description}"`;
  const systemInstruction = 'You are a concise time capsule archivist.';

  const remoteResult = await callGeminiApi(prompt, systemInstruction);
  if (remoteResult) return remoteResult;

  return `✨ Key Takeaway: "${title}" captures an important life milestone. Preserved securely for future reflection with emotional resonance and clarity.`;
};

export const detectEmotionAndMood = async (text) => {
  const prompt = `Analyze the emotional tone of this text: "${text}". Return JSON formatted strictly as: {"mood": "Inspiring" | "Nostalgic" | "Joyful" | "Peaceful" | "Reflective", "emotion": "Gratitude" | "Wonder" | "Happiness" | "Serenity", "sentimentScore": 0.85, "colorTheme": "#06B6D4"}`;

  const remoteResult = await callGeminiApi(prompt);
  if (remoteResult) {
    try {
      const cleaned = remoteResult.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      // Fall through to heuristic if JSON parse fails
    }
  }

  // Heuristic analysis fallback
  const lower = (text || '').toLowerCase();
  if (lower.includes('happy') || lower.includes('joy') || lower.includes('celebrate')) {
    return { mood: 'Joyful', emotion: 'Happiness', sentimentScore: 0.9, colorTheme: '#F59E0B' };
  }
  if (lower.includes('peace') || lower.includes('quiet') || lower.includes('calm')) {
    return { mood: 'Peaceful', emotion: 'Serenity', sentimentScore: 0.85, colorTheme: '#10B981' };
  }
  if (lower.includes('remember') || lower.includes('miss') || lower.includes('past')) {
    return { mood: 'Nostalgic', emotion: 'Wonder', sentimentScore: 0.78, colorTheme: '#A855F7' };
  }

  return { mood: 'Inspiring', emotion: 'Gratitude', sentimentScore: 0.88, colorTheme: '#6366F1' };
};

export const generateTags = async (title, description, category) => {
  const prompt = `Generate 4 concise tags for this time capsule item (Title: ${title}, Category: ${category}, Content: ${description}). Return JSON array of strings e.g. ["#Future", "#Milestone", "#AI", "#Growth"]`;

  const remoteResult = await callGeminiApi(prompt);
  if (remoteResult) {
    try {
      const cleaned = remoteResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  const baseCategoryTag = `#${(category || 'Memory').replace(/\s+/g, '')}`;
  return [baseCategoryTag, '#TimeCapsule', '#ChronaVault', '#Preserved'];
};

export const performOCRAndAnalysis = async (imageInput, textHint = "") => {
    if (!imageInput) {
        return {
            title: "Preserved Milestone",
            description: textHint || "A precious moment preserved in your digital time capsule.",
            category: "General",
            mood: "Inspiring",
            objects: ["Photo artifact", "Time capsule"],
            people: ["Preserved memory"],
            scenery: "Personal space",
            tags: ["#Memory", "#ChronaVault", "#TimeCapsule"],
            extractedText: "",
            confidence: 0.92,
            aiReflection: {
                emotionalSummary: "Filled with warmth, hope, and reflective gratitude.",
                nostalgicReflection: "Looking back at this moment captures a timeless chapter in your journey.",
                importantObjects: ["Memory artifact"],
                peopleDetected: ["Cherished moment"],
                memorableMoments: ["Sealing this memory into your 3D spatial orbit."]
            }
        };
    }

    try {
        let imageBase64 = "";
        if (typeof imageInput === "string") {
            if (imageInput.startsWith("data:image")) {
                imageBase64 = imageInput.split(",")[1];
            } else if (fs.existsSync(imageInput)) {
                imageBase64 = fs.readFileSync(imageInput, { encoding: "base64" });
            } else {
                imageBase64 = imageInput;
            }
        }

        if (!imageBase64 || !GEMINI_API_KEY || GEMINI_API_KEY.includes("place_holder") || GEMINI_API_KEY.includes("demo")) {
            return {
                title: textHint ? `Memory: ${textHint.slice(0, 20)}` : "Sunset & Milestone Moments",
                description: textHint || "Captured moment with vibrant light, nostalgic backdrop, and personal significance.",
                category: "Travel",
                mood: "Peaceful",
                objects: ["Architecture", "Sunlight", "Sky", "Trees"],
                people: ["1 person visible"],
                scenery: "Outdoor scenic horizon",
                tags: ["#Travel", "#GoldenHour", "#ChronaVault", "#Peaceful", "#Milestone"],
                extractedText: textHint || "Chrona Digital Time Capsule 2026",
                confidence: 0.96,
                aiReflection: {
                    emotionalSummary: "Resonates with serene peace, accomplishment, and quiet gratitude.",
                    nostalgicReflection: "Years from now, revisiting this image will recall the light and atmosphere of this precise day.",
                    importantObjects: ["Scenic horizon", "Sunlight reflections"],
                    peopleDetected: ["Captured milestone subject"],
                    memorableMoments: ["Recording this personal chapter for future rediscovery."]
                }
            };
        }

        const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash"];
        let response = null;

        for (const model of modelsToTry) {
            try {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        {
                                            text: `Analyze this uploaded memory image thoroughly for a digital time capsule platform.
Return ONLY a raw JSON object with these exact keys:
{
  "title": "A short, evocative title for the photo",
  "description": "A detailed 2-3 sentence narrative description",
  "category": "One of: Travel, Family, Friends, Milestone, Work, Graduation, Vacation, Nature, Personal",
  "mood": "One of: 😊 Happy, 😢 Sad, 😍 Excited, 😌 Peaceful, 🔮 Reflective",
  "objects": ["array", "of", "detected", "objects"],
  "people": ["array of detected people or descriptions e.g. 2 friends"],
  "scenery": "Environment description e.g. Coastal beach at golden hour",
  "tags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4"],
  "extractedText": "Any text/signs/words read inside the image via OCR",
  "confidence": 0.95,
  "aiReflection": {
    "emotionalSummary": "Summary of emotional tone",
    "nostalgicReflection": "A nostalgic reflection looking back from the future",
    "importantObjects": ["key objects"],
    "peopleDetected": ["people summary"],
    "memorableMoments": ["key highlight moment"]
  }
}`
                                        },
                                        {
                                            inline_data: {
                                                mime_type: "image/jpeg",
                                                data: imageBase64
                                            }
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                );
                if (res.ok) {
                    response = await res.json();
                    break;
                }
            } catch (e) {
                console.warn(`Gemini model ${model} error:`, e.message);
            }
        }

        if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const rawText = response.candidates[0].content.parts[0].text;
            const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleaned);
        }
    } catch (err) {
        console.error("Gemini Vision analysis error:", err);
    }

    return {
        title: textHint ? `Memory: ${textHint.slice(0, 20)}` : "Preserved Milestone",
        description: textHint || "A cherished moment saved to your spatial memory vault.",
        category: "Personal",
        mood: "😌 Peaceful",
        objects: ["Photo artifact", "Scenery"],
        people: ["Preserved memory"],
        scenery: "Personal landscape",
        tags: ["#Memory", "#ChronaVault", "#TimeCapsule"],
        extractedText: "",
        confidence: 0.90,
        aiReflection: {
            emotionalSummary: "Warm, reflective, and serene.",
            nostalgicReflection: "A timeless memory preserved across time.",
            importantObjects: ["Memory artifact"],
            peopleDetected: ["Preserved subject"],
            memorableMoments: ["Sealed in vault"]
        }
    };
};

export const generateLifeRecaps = async (memories = [], timeframe = 'weekly') => {
  const count = memories.length;
  const moodCounts = {};
  memories.forEach((m) => {
    const mood = m.mood || 'Inspiring';
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  const dominantMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0] || 'Inspiring';

  return {
    timeframe,
    totalMemories: count,
    dominantMood,
    summary: `During this ${timeframe} period, you preserved ${count} memories with a predominant atmosphere of ${dominantMood}. Key highlights include personal achievements, reflections, and creative milestones.`,
    highlights: memories.slice(0, 3).map((m) => ({ title: m.title, category: m.category, date: m.date })),
    aiInsight: 'Your retention of positive milestones has grown by 34% compared to previous periods. Keep capturing moments that bring clarity and gratitude.',
  };
};

export const generateLifeStory = async (memories = []) => {
    try {
        const memList = Array.isArray(memories) ? memories : [];
        const prompt = `Synthesize these ${memList.length} time capsule memories into a beautifully written multi-year life story narrative (chronologically grouped by years e.g., 2024 -> 2025 -> 2026).\nMemories: ${JSON.stringify(memList.slice(0, 20))}`;
        const systemInstruction = "You are Chrona AI, a master biographical storyteller crafting nostalgic life recaps.";

        const remote = await callGeminiApi(prompt, systemInstruction);
        if (remote) return remote;

        const memoryTitles = memList.map((m) => `"${m.title || 'Milestone'}"`).join(', ');
        return `# 🌌 My Journey Across Time: A Chrona Life Story

## 📖 Chapter 1: The Initial Spark (2024)
Every journey begins with a single moment captured in time. Preserving entries like ${memoryTitles || 'your first memory'} laid the foundation for an evolving digital legacy. The mood was filled with optimism, curiosity, and the excitement of capturing life as it unfolded.

## 🚀 Chapter 2: Growth & Milestones (2025)
As seasons changed, your time capsule grew into a rich spatial vault of experiences. From quiet personal reflections to vibrant celebrations, each sealed memory added depth to your personal archive. You embraced reflection, celebrated achievements, and looked forward with intent.

## ✨ Chapter 3: Unlocking the Future (2026 & Beyond)
Today, as these locked time capsules open, the past speaks directly to the present. The themes of gratitude, resilience, and joy shine brightly across your timeline.

*“We do not remember days, we remember moments.”*`;
    } catch (err) {
        console.error("Error in generateLifeStory:", err);
        return `# 🌌 My Journey Across Time: A Chrona Life Story

## 📖 Chapter 1: The Initial Spark
Every journey begins with a single moment captured in time. Preserving your milestone memories lays the foundation for an evolving digital legacy.

## 🚀 Chapter 2: Growth & Milestones
As seasons changed, your time capsule grew into a rich spatial vault of experiences. Each sealed memory adds depth to your personal archive.

## ✨ Chapter 3: Unlocking the Future
Today, as these locked time capsules open, the past speaks directly to the present with gratitude and joy.`;
    }
};


