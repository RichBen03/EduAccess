import express from 'express';
import { body } from 'express-validator';
import {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  getSchoolStatistics,
  getSchoolResources
} from '../controllers/schoolController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/schools:
 *   get:
 *     summary: Get all schools
 *     tags: [Schools]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schools retrieved successfully
 */
router.get('/', getAllSchools);

/**
 * @swagger
 * /api/schools/{id}:
 *   get:
 *     summary: Get school by ID
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School retrieved successfully
 *       404:
 *         description: School not found
 */
router.get('/:id', getSchoolById);

/**
 * @swagger
 * /api/schools/{id}/statistics:
 *   get:
 *     summary: Get school statistics
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       404:
 *         description: School not found
 */
router.get('/:id/statistics', getSchoolStatistics);

/**
 * @swagger
 * /api/schools/{id}/resources:
 *   get:
 *     summary: Get school resources
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 *       404:
 *         description: School not found
 */
router.get('/:id/resources', getSchoolResources);

// Admin only routes
router.use(protect);
router.use(requireAdmin);

/**
 * @swagger
 * /api/schools:
 *   post:
 *     summary: Create new school (Admin only)
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - address
 *               - admin
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               address:
 *                 type: object
 *                 required:
 *                   - city
 *                   - state
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   website:
 *                     type: string
 *                     format: uri
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: uri
 *               admin:
 *                 type: string
 *     responses:
 *       201:
 *         description: School created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: School already exists
 */
router.post(
  '/',
  [
    body('name').notEmpty().trim().isLength({ max: 100 }),
    body('code').isLength({ min: 3, max: 10 }).matches(/^[A-Z0-9]+$/),
    body('address.city').notEmpty().trim(),
    body('address.state').notEmpty().trim(),
    body('admin').isMongoId(),
    body('contact.email').optional().isEmail(),
    body('contact.website').optional().isURL(),
    body('logo').optional().isURL()
  ],
  createSchool
);

/**
 * @swagger
 * /api/schools/{id}:
 *   put:
 *     summary: Update school (Admin only)
 *     tags: [Schools]
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
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               contact:
 *                 type: object
 *                 properties:
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   website:
 *                     type: string
 *                     format: uri
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: uri
 *               admin:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: School updated successfully
 *       404:
 *         description: School not found
 *       409:
 *         description: School with this name or code already exists
 */
router.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ max: 100 }),
    body('code').optional().isLength({ min: 3, max: 10 }).matches(/^[A-Z0-9]+$/),
    body('address.city').optional().trim(),
    body('address.state').optional().trim(),
    body('admin').optional().isMongoId(),
    body('contact.email').optional().isEmail(),
    body('contact.website').optional().isURL(),
    body('logo').optional().isURL()
  ],
  updateSchool
);

export default router;