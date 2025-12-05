import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  uploadResource,
  getResources,
  getResourceById,
  downloadResource,
  updateResource,
  deleteResource,
  getRelatedResources
} from '../controllers/resourceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireTeacher } from '../middlewares/roleMiddleware.js';
import storageService from '../services/storageService.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: storageService.getMulterStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and media types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'audio/mpeg',
      'application/zip'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Get all resources with filtering
 *     tags: [Resources]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *       - in: query
 *         name: school
 *         schema:
 *           type: string
 *       - in: query
 *         name: strand
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: uploader
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 */
router.get('/', getResources);

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource retrieved successfully
 *       404:
 *         description: Resource not found
 */
router.get('/:id', getResourceById);

/**
 * @swagger
 * /api/resources/{id}/related:
 *   get:
 *     summary: Get related resources
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Related resources retrieved successfully
 *       404:
 *         description: Resource not found
 */
router.get('/:id/related', getRelatedResources);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Upload a new resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - subject
 *               - grade
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               subject:
 *                 type: string
 *               grade:
 *                 type: string
 *               strand:
 *                 type: string
 *               tags:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Resource uploaded successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Teacher or Admin access required
 */
router.post(
  '/',
  requireTeacher,
  upload.single('file'),
  [
    body('title').notEmpty().trim().isLength({ max: 200 }),
    body('description').notEmpty().trim().isLength({ max: 1000 }),
    body('subject').notEmpty().trim(),
    body('grade').notEmpty().trim(),
    body('strand').optional().trim(),
    body('tags').optional().trim(),
    body('isPublic').optional().isBoolean()
  ],
  uploadResource
);

/**
 * @swagger
 * /api/resources/{id}/download:
 *   get:
 *     summary: Download resource file
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download URL generated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Resource not found
 */
router.get('/:id/download', downloadResource);

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               subject:
 *                 type: string
 *               grade:
 *                 type: string
 *               strand:
 *                 type: string
 *               tags:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Resource not found
 */
router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('subject').optional().trim(),
    body('grade').optional().trim(),
    body('strand').optional().trim(),
    body('tags').optional().trim(),
    body('isPublic').optional().isBoolean()
  ],
  updateResource
);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Resource not found
 */
router.delete('/:id', deleteResource);

export default router;