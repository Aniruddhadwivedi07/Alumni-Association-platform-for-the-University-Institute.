const express = require('express');
const prisma = require('../prisma');
const { requireAuth, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

function formatStory(story) {
  return {
    id: story.id,
    title: story.title,
    content: story.content,
    imageUrl: story.imageUrl,
    publishedAt: story.publishedAt,
    authorName: story.author.alumniProfile?.fullName || 'Alumni member'
  };
}

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = 9;
    const where = { isPublished: true };
    const [totalRecords, stories] = await Promise.all([
      prisma.successStory.count({ where }),
      prisma.successStory.findMany({
        where,
        include: { author: { include: { alumniProfile: true } } },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);
    res.json({ success: true, data: stories.map(formatStory), pagination: { totalPages: Math.ceil(totalRecords / limit) || 1 } });
  } catch (error) { next(error); }
});

router.get('/:storyId', async (req, res, next) => {
  try {
    const story = await prisma.successStory.findFirst({
      where: { id: req.params.storyId, isPublished: true },
      include: { author: { include: { alumniProfile: true } } }
    });
    if (!story) return res.status(404).json({ success: false, error: { message: 'Story not found' } });
    res.json({ success: true, data: formatStory(story) });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, authorizeRoles(ROLES.ALUMNI), async (req, res, next) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (typeof title !== 'string' || !title.trim() || title.length > 200 || typeof content !== 'string' || !content.trim() || content.length > 10000 || (imageUrl && (typeof imageUrl !== 'string' || !/^https?:\/\//.test(imageUrl)))) {
      return res.status(400).json({ success: false, error: { message: 'Enter a title, story, and optional valid image URL.' } });
    }
    const story = await prisma.successStory.create({ data: {
      title: title.trim(), content: content.trim(), imageUrl: imageUrl || null, authorId: req.user.id
    } });
    res.status(201).json({ success: true, data: { id: story.id }, message: 'Story submitted for review.' });
  } catch (error) { next(error); }
});

module.exports = router;
