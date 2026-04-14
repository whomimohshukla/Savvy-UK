// src/routes/bills.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { uploadBill, getBills, getBill, deleteBill } from '../controllers/bills/bills.controller';
import { authenticate } from '../middleware/authenticate';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();
router.use(authenticate);
router.post('/upload', upload.single('bill'), uploadBill);
router.get('/', getBills);
router.get('/:id', getBill);
router.delete('/:id', deleteBill);
export default router;
