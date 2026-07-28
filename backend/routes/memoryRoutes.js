import express from 'express';
import {
  createMemory,
  getMemories,
  getMemoryById,
  updateMemory,
  deleteMemory,
  uploadAttachment,
  toggleFavorite,
  toggleArchive,
  shareMemory,
  exportMemories,
  searchMemories,
  importMemories,
} from '../controllers/memoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createMemory);
router.get('/', getMemories);
router.get('/:id', getMemoryById);
router.put('/:id', updateMemory);
router.delete('/:id', deleteMemory);

router.post('/upload', upload.single('file'), uploadAttachment);
router.post('/favorite', toggleFavorite);
router.post('/archive', toggleArchive);
router.post('/share', shareMemory);
router.post('/export', exportMemories);
router.post('/search', searchMemories);
router.post('/import', importMemories);

export default router;
