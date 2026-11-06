const prisma = require('../prisma');
const { ROLES } = require('../constants/roles');

/**
 * GET /api/directory/alumni
 * Search and list verified alumni profiles with filtering, sorting, and pagination
 */
async function getAlumniDirectory(req, res, next) {
  try {
    const {
      search,
      graduationYear,
      department,
      company,
      page,
      limit,
      sortBy,
      sortOrder
    } = req.query;

    // Build the query where clause
    const andConditions = [
      {
        user: {
          isActive: true,
          role: {
            name: ROLES.ALUMNI
          }
        }
      }
    ];

    // Global search across: fullName, department, currentCompany, currentJobTitle
    if (search) {
      andConditions.push({
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
          { currentCompany: { contains: search, mode: 'insensitive' } },
          { currentJobTitle: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    // Specific filters combined with AND logic
    if (graduationYear !== undefined) {
      andConditions.push({
        graduationYear
      });
    }

    if (department) {
      andConditions.push({
        department: { contains: department, mode: 'insensitive' }
      });
    }

    if (company) {
      andConditions.push({
        currentCompany: { contains: company, mode: 'insensitive' }
      });
    }

    const where = {
      AND: andConditions
    };

    // Pagination calculations
    const skip = (page - 1) * limit;
    const take = limit;

    // Run data query and total count query in parallel
    const [totalRecords, profiles] = await Promise.all([
      prisma.alumniProfile.count({ where }),
      prisma.alumniProfile.findMany({
        where,
        select: {
          id: true,
          userId: true,
          fullName: true,
          graduationYear: true,
          department: true,
          currentJobTitle: true,
          currentCompany: true,
          bio: true,
          linkedinUrl: true,
          createdAt: true,
          user: {
            select: {
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Format output records with only safe, publicly appropriate fields
    const sanitizedProfiles = profiles.map((p) => ({
      id: p.id,
      userId: p.userId,
      role: p.user?.role?.name || ROLES.ALUMNI,
      fullName: p.fullName,
      graduationYear: p.graduationYear,
      department: p.department,
      currentJobTitle: p.currentJobTitle,
      currentCompany: p.currentCompany,
      bio: p.bio,
      linkedinUrl: p.linkedinUrl,
      createdAt: p.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: sanitizedProfiles,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalRecords,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAlumniDirectory
};

