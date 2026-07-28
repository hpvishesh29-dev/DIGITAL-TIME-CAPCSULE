import {
  generateAIChatResponse,
  summarizeMemoryText,
  detectEmotionAndMood,
  generateTags,
  performOCRAndAnalysis,
  generateLifeRecaps,
  generateLifeStory,
} from '../services/aiService.js';


export const chatWithAI = async (req, res, next) => {
  try {
    const { prompt, history, memoryContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'User prompt is required' });
    }

    const aiMessage = await generateAIChatResponse(prompt, history || [], memoryContext || []);

    res.json({
      success: true,
      response: aiMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const summarizeMemory = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const summary = await summarizeMemoryText(title || 'Time Capsule', description || '');
    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

export const detectMood = async (req, res, next) => {
  try {
    const { text } = req.body;
    const moodData = await detectEmotionAndMood(text || '');
    res.json({ success: true, ...moodData });
  } catch (error) {
    next(error);
  }
};

export const generateMemoryTags = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const tags = await generateTags(title, description, category);
    res.json({ success: true, tags });
  } catch (error) {
    next(error);
  }
};

export const searchSemanticMemories = async (req, res, next) => {
  try {
    const { query, memories } = req.body;
    const list = Array.isArray(memories) ? memories : [];
    const q = (query || '').toLowerCase();

    // Semantic relevance scoring heuristic
    const ranked = list
      .map((m) => {
        let score = 0;
        if (m.title?.toLowerCase().includes(q)) score += 10;
        if (m.description?.toLowerCase().includes(q)) score += 5;
        if (m.mood?.toLowerCase().includes(q)) score += 3;
        if (m.tags?.some((t) => t.toLowerCase().includes(q))) score += 4;
        return { memory: m, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.memory);

    res.json({
      success: true,
      query,
      results: ranked.length ? ranked : list.slice(0, 3),
    });
  } catch (error) {
    next(error);
  }
};

export const recommendMemories = async (req, res, next) => {
  try {
    const { currentMemoryId, memories } = req.body;
    const list = Array.isArray(memories) ? memories : [];
    const current = list.find((m) => m.id === currentMemoryId) || list[0];

    let matches = list.filter((m) => m.id !== currentMemoryId);
    if (current?.category) {
      const sameCategory = matches.filter((m) => m.category === current.category);
      if (sameCategory.length > 0) matches = sameCategory;
    }

    res.json({
      success: true,
      recommendations: matches.slice(0, 4),
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeImage = async (req, res, next) => {
  try {
    const file = req.file;
    const { textHint, imageBase64 } = req.body;

    const inputData = file ? file.path : (imageBase64 || null);
    const ocrResult = await performOCRAndAnalysis(inputData, textHint);

    res.json({
      success: true,
      analysis: ocrResult,
    });
  } catch (error) {
    next(error);
  }
};

export const performOCR = async (req, res, next) => {
  try {
    const { textHint, imageBase64 } = req.body;
    const ocrResult = await performOCRAndAnalysis(imageBase64 || null, textHint);
    res.json({ success: true, ocr: ocrResult });
  } catch (error) {
    next(error);
  }
};

export const getLifeInsights = async (req, res, next) => {
  try {
    const { timeframe = 'weekly', memories = [] } = req.body;
    const recaps = await generateLifeRecaps(memories, timeframe);
    res.json({
      success: true,
      insights: recaps,
    });
  } catch (error) {
    next(error);
  }
};

export const generateStory = async (req, res, next) => {
  try {
    const { memories = [] } = req.body;
    const story = await generateLifeStory(memories);
    res.json({ success: true, story });
  } catch (error) {
    next(error);
  }
};


