import express from 'express';
import { body } from 'express-validator';
import {
  getPendingResources,
  approveResource,
  rejectResource,
  getModerationHistory,
  getModerationStatistics,
  getResourceModerationHistory
} from '../controllers/moderationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(requireAdmin);

/**
 * @swagger
 * /api/moderation/pending:
 *   get:
 *     summary: Get pending resources for moderation
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Pending resources retrieved successfully
 */
router.get('/pending', getPendingResources);

/**
 * @swagger
 * /api/moderation/resources/{id}/approve:
 *   post:
 *     summary: Approve a resource
 *     tags: [Moderation]
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
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource approved successfully
 *       400:
 *         description: Resource is not pending
 *       404:
 *         description: Resource not found
 */
router.post(
  '/resources/:id/approve',
  [
    body('notes').optional().trim().isLength({ max: 500 })
  ],
  approveResource
);

/**
 * @swagger
 * /api/moderation/resources/{id}/reject:
 *   post:
 *     summary: Reject a resource
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource rejected successfully
 *       400:
 *         description: Resource is not pending or notes are required
 *       404:
 *         description: Resource not found
 */
router.post(
  '/resources/:id/reject',
  [
    body('notes').notEmpty().trim().isLength({ max: 500 })
  ],
  rejectResource
);

/**
 * @swagger
 * /api/moderation/history:
 *   get:
 *     summary: Get moderation history
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [approved, rejected]
 *       - in: query
 *         name: moderator
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Moderation history retrieved successfully
 */
router.get('/history', getModerationHistory);

/**
 * @swagger
 * /api/moderation/statistics:
 *   get:
 *     summary: Get moderation statistics
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/statistics', getModerationStatistics);

/**
 * @swagger
 * /api/moderation/resources/{id}/history:
 *   get:
 *     summary: Get resource moderation history
 *     tags: [Moderation]
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
 *         description: Resource moderation history retrieved successfully
 *       404:
 *         description: Resource not found
 */
router.get('/resources/:id/history', getResourceModerationHistory);

export default router;