const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../prisma');
const { validateBody } = require('../middlewares/validate');
const { requireAuth, authorizeRoles } = require('../middlewares/auth');

const schema = z.object({
  category: z.enum(['GENERAL', 'EVENTS', 'MENTORSHIP', 'JOBS', 'WEBSITE']),
  subject: z.string().trim().min(1).max(150),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(1).max(3000)
}).strict();

router.post('/', validateBody(schema), async (req, res, next) => {
  try {
    const feedback = await prisma.feedback.create({ data: req.body });
    res.status(201).json({ success: true, data: { id: feedback.id }, message: 'Feedback submitted successfully' });
  } catch (error) { next(error); }
});

router.get('/', requireAuth, authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const rows = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data: rows.map((row) => ({ ...row, user: 'Community member' })) });
  } catch (error) { next(error); }
});

module.exports = router;
