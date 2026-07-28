import { adminDb } from '../config/firebase-admin.js';
import { detectEmotionAndMood, generateTags, summarizeMemoryText } from '../services/aiService.js';
import {
  generateMemoryPDFStream,
  generateMemoryZipStream,
  generateMemoryMarkdown,
} from '../services/exportService.js';

// In-memory backing store for demo/standalone server execution
let inMemoryVault = [];

export const createMemory = async (req, res, next) => {
  try {
    const userId = req.user?.uid || 'demo-user-123';
    const {
      title,
      description,
      category,
      mood,
      emotion,
      colorTheme,
      location,
      weather,
      people,
      tags,
      unlockDate,
      isPrivate,
      isFavorite,
      isArchived,
      attachments,
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required for time capsule creation' });
    }

    // AI Enrichment if mood or tags are missing
    let aiMood = mood;
    let aiEmotion = emotion;
    let aiTheme = colorTheme;

    if (!mood || !emotion) {
      const aiAnalysis = await detectEmotionAndMood(`${title} ${description || ''}`);
      aiMood = mood || aiAnalysis.mood;
      aiEmotion = emotion || aiAnalysis.emotion;
      aiTheme = colorTheme || aiAnalysis.colorTheme;
    }

    let finalTags = tags;
    if (!tags || !tags.length) {
      finalTags = await generateTags(title, description, category);
    }

    const aiSummary = await summarizeMemoryText(title, description || '');

    const memoryDoc = {
      id: 'mem-' + Date.now() + '-' + Math.round(Math.random() * 1000),
      userId,
      title,
      description: description || '',
      category: category || 'Personal',
      mood: aiMood || 'Inspiring',
      emotion: aiEmotion || 'Gratitude',
      colorTheme: aiTheme || '#6366F1',
      location: location || 'Spatial Orbit',
      weather: weather || 'Clear Skies',
      people: Array.isArray(people) ? people : [],
      tags: Array.isArray(finalTags) ? finalTags : [],
      aiSummary,
      attachments: Array.isArray(attachments) ? attachments : [],
      isFavorite: Boolean(isFavorite),
      isArchived: Boolean(isArchived),
      isPrivate: isPrivate !== undefined ? Boolean(isPrivate) : true,
      unlockDate: unlockDate || null,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orbitRadius: 3.2 + Math.random() * 1.8,
      orbitSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.1 + Math.random() * 0.15),
      initialAngle: Math.random() * Math.PI * 2,
      yOffset: (Math.random() - 0.5) * 2.2,
      lockHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
    };

    if (adminDb) {
      try {
        const docRef = await adminDb.collection('memories').add(memoryDoc);
        memoryDoc.id = docRef.id;
      } catch (fbErr) {
        console.warn('Firestore Admin add error, saving locally:', fbErr.message);
      }
    }

    inMemoryVault.unshift(memoryDoc);

    res.status(201).json({
      success: true,
      message: 'Time capsule memory sealed and saved to vault',
      memory: memoryDoc,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemories = async (req, res, next) => {
  try {
    const userId = req.user?.uid || 'demo-user-123';

    if (adminDb) {
      try {
        const snapshot = await adminDb
          .collection('memories')
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .get();

        const firestoreMemories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (firestoreMemories.length > 0) {
          return res.json({ success: true, count: firestoreMemories.length, memories: firestoreMemories });
        }
      } catch (fbErr) {
        console.warn('Firestore query fallback:', fbErr.message);
      }
    }

    const userMemories = inMemoryVault.filter((m) => m.userId === userId || !m.userId);
    res.json({
      success: true,
      count: userMemories.length,
      memories: userMemories,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const found = inMemoryVault.find((m) => m.id === id);

    if (!found) {
      return res.status(404).json({ success: false, message: 'Time capsule memory not found' });
    }

    res.json({ success: true, memory: found });
  } catch (error) {
    next(error);
  }
};

export const updateMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const index = inMemoryVault.findIndex((m) => m.id === id);

    if (index === -1) {
      const updated = { id, ...req.body, updatedAt: new Date().toISOString() };
      inMemoryVault.unshift(updated);
      return res.json({ success: true, memory: updated });
    }

    inMemoryVault[index] = {
      ...inMemoryVault[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, memory: inMemoryVault[index] });
  } catch (error) {
    next(error);
  }
};

export const deleteMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    inMemoryVault = inMemoryVault.filter((m) => m.id !== id);

    res.json({ success: true, message: 'Memory removed from spatial vault', id });
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No media or document file provided' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachmentObj = {
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'File attachment uploaded successfully',
      attachment: attachmentObj,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.body;
    const target = inMemoryVault.find((m) => m.id === id);
    if (target) {
      target.isFavorite = !target.isFavorite;
      return res.json({ success: true, isFavorite: target.isFavorite });
    }
    res.json({ success: true, isFavorite: true });
  } catch (error) {
    next(error);
  }
};

export const toggleArchive = async (req, res, next) => {
  try {
    const { id } = req.body;
    const target = inMemoryVault.find((m) => m.id === id);
    if (target) {
      target.isArchived = !target.isArchived;
      return res.json({ success: true, isArchived: target.isArchived });
    }
    res.json({ success: true, isArchived: true });
  } catch (error) {
    next(error);
  }
};

export const shareMemory = async (req, res, next) => {
  try {
    const { memoryId, recipientEmail } = req.body;
    res.json({
      success: true,
      message: `Memory successfully shared with ${recipientEmail}`,
    });
  } catch (error) {
    next(error);
  }
};

export const exportMemories = async (req, res, next) => {
  try {
    const { format = 'pdf', memoryIds } = req.body;
    let targets = inMemoryVault;

    if (memoryIds && memoryIds.length > 0) {
      targets = inMemoryVault.filter((m) => memoryIds.includes(m.id));
    }

    if (format === 'pdf') {
      return generateMemoryPDFStream(targets, res);
    } else if (format === 'zip') {
      return generateMemoryZipStream(targets, res);
    } else if (format === 'markdown' || format === 'md') {
      const mdString = generateMemoryMarkdown(targets);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="Chrona_Memories.md"');
      return res.send(mdString);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="Chrona_Memories.json"');
      return res.json(targets);
    }
  } catch (error) {
    next(error);
  }
};

export const searchMemories = async (req, res, next) => {
  try {
    const { query = '', category, mood, tag, isFavorite } = req.body;
    const q = query.toLowerCase().trim();

    let results = inMemoryVault;

    if (q) {
      results = results.filter((m) => {
        const titleMatch = (m.title || '').toLowerCase().includes(q);
        const descMatch = (m.description || '').toLowerCase().includes(q);
        const moodMatch = (m.mood || '').toLowerCase().includes(q);
        const tagsMatch = m.tags ? m.tags.some((t) => t.toLowerCase().includes(q)) : false;
        return titleMatch || descMatch || moodMatch || tagsMatch;
      });
    }

    if (category && category !== 'All') {
      results = results.filter((m) => m.category === category);
    }

    if (mood) {
      results = results.filter((m) => m.mood === mood);
    }

    if (isFavorite) {
      results = results.filter((m) => m.isFavorite);
    }

    res.json({
      success: true,
      count: results.length,
      memories: results,
    });
  } catch (error) {
    next(error);
  }
};

export const importMemories = async (req, res, next) => {
  try {
    const { importedMemories } = req.body;
    if (!Array.isArray(importedMemories)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: importedMemories must be an array' });
    }

    const userId = req.user?.uid || 'demo-user-123';
    const added = importedMemories.map((m) => ({
      ...m,
      id: m.id || 'imported-' + Date.now() + '-' + Math.round(Math.random() * 1000),
      userId,
      createdAt: new Date().toISOString(),
    }));

    inMemoryVault.unshift(...added);

    res.json({
      success: true,
      message: `Successfully imported ${added.length} time capsules into your spatial vault.`,
      count: added.length,
    });
  } catch (error) {
    next(error);
  }
};
