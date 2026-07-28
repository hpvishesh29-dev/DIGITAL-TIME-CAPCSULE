import express from 'express';
import {
  chatWithAI,
  summarizeMemory,
  detectMood,
  generateMemoryTags,
  searchSemanticMemories,
  recommendMemories,
  analyzeImage,
  performOCR,
  getLifeInsights,
  generateStory,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(aiLimiter);

router.post('/chat', chatWithAI);
router.post('/summarize', summarizeMemory);
router.post('/mood', detectMood);
router.post('/tags', generateMemoryTags);
router.post('/search', searchSemanticMemories);
router.post('/recommend', recommendMemories);
router.post('/analyze-image', upload.single('image'), analyzeImage);
router.post('/ocr', upload.single('image'), performOCR);
router.post('/insights', getLifeInsights);
router.post('/story', generateStory);

export default router;


