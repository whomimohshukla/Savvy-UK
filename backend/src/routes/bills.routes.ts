import { Router } from 'express';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import { uploadBill, getBills, getBill, deleteBill } from '../controllers/bills/bills.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { billUploadSchema } from '../validators/bills.validators';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'));
    }
  },
});

// Limit bill uploads to 20 per hour per IP to prevent abuse
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => (req as any).userId ?? req.ip ?? 'unknown',
  message: { success: false, error: 'Upload limit reached. Try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();
router.use(authenticate);

router.post('/upload', uploadLimiter, upload.single('bill'), validate(billUploadSchema), uploadBill);
router.get('/',        getBills);
router.get('/:id',     getBill);
router.delete('/:id',  deleteBill);

export default router;
