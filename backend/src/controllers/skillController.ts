import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getAllSkills = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      q,
      category,
      skillLevel,
      learningMode,
      language,
      generalArea,
      ownerId,
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string) || 12));
    const skip = (pageNum - 1) * take;

    const where: any = {
      owner: {
        isSuspended: false,
      }
    };

    if (q && typeof q === 'string' && q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        { skillName: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { targetLearners: { contains: searchTerm } },
        { generalArea: { contains: searchTerm } },
      ];
    }

    if (category && typeof category === 'string' && category !== 'All' && category !== 'All Categories') {
      where.category = category;
    }

    if (skillLevel && typeof skillLevel === 'string' && skillLevel !== 'All' && skillLevel !== 'All Levels') {
      where.skillLevel = skillLevel;
    }

    if (learningMode && typeof learningMode === 'string' && learningMode !== 'All' && learningMode !== 'All Modes') {
      if (learningMode === 'Online') {
        where.learningMode = { in: ['Online', 'Both'] };
      } else if (learningMode === 'In-Person') {
        where.learningMode = { in: ['In-Person', 'Both'] };
      } else {
        where.learningMode = learningMode;
      }
    }

    if (language && typeof language === 'string' && language !== 'All' && language !== 'All Languages') {
      where.language = { contains: language };
    }

    if (generalArea && typeof generalArea === 'string' && generalArea.trim()) {
      where.generalArea = { contains: generalArea.trim() };
    }

    if (ownerId && typeof ownerId === 'string') {
      where.ownerId = ownerId;
    }

    const [totalSkills, skills] = await Promise.all([
      prisma.skill.count({ where }),
      prisma.skill.findMany({
        where,
        skip,
        take,
        orderBy: { createdDate: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
              verificationStatus: true,
              location: true,
              privacyAreaVisible: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          connections: {
            where: { status: 'Completed' },
            select: { id: true },
          },
          savedByUsers: req.user ? {
            where: { userId: req.user.id },
            select: { id: true },
          } : false,
        },
      }),
    ]);

    const formattedSkills = skills.map((skill) => {
      const reviewCount = skill.reviews.length;
      const totalRating = skill.reviews.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 5.0;
      const learnersHelped = skill.connections.length;
      const isSaved = Array.isArray(skill.savedByUsers) && skill.savedByUsers.length > 0;

      return {
        id: skill.id,
        skillName: skill.skillName,
        category: skill.category,
        description: skill.description,
        skillLevel: skill.skillLevel,
        language: skill.language,
        learningMode: skill.learningMode,
        availableDays: skill.availableDays,
        availableTimes: skill.availableTimes,
        targetLearners: skill.targetLearners,
        generalArea: skill.owner.privacyAreaVisible ? skill.generalArea : 'Safe local area',
        createdDate: skill.createdDate,
        owner: {
          id: skill.owner.id,
          name: skill.owner.name,
          profilePhoto: skill.owner.profilePhoto,
          verificationStatus: skill.owner.verificationStatus,
        },
        rating: averageRating,
        reviewCount,
        learnersHelped,
        isSaved,
      };
    });

    res.status(200).json({
      success: true,
      skills: formattedSkills,
      pagination: {
        page: pageNum,
        limit: take,
        totalItems: totalSkills,
        totalPages: Math.ceil(totalSkills / take) || 1,
      },
    });
  } catch (error: any) {
    console.error('getAllSkills error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve skills.' });
  }
};

export const getSkillById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            bio: true,
            location: true,
            languages: true,
            experience: true,
            verificationStatus: true,
            privacyAreaVisible: true,
            createdDate: true,
            receivedReviews: {
              select: { rating: true },
            },
            connectionsAsUser1: {
              where: { status: 'Completed' },
              select: { id: true },
            },
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
              },
            },
          },
          orderBy: { createdDate: 'desc' },
        },
        connections: {
          where: { status: 'Completed' },
          select: { id: true },
        },
        savedByUsers: currentUserId ? {
          where: { userId: currentUserId },
          select: { id: true },
        } : false,
      },
    });

    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found.' });
      return;
    }

    const reviewCount = skill.reviews.length;
    const totalRating = skill.reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 5.0;
    const isSaved = Array.isArray(skill.savedByUsers) && skill.savedByUsers.length > 0;
    const isOwner = currentUserId === skill.owner.id;

    res.status(200).json({
      success: true,
      skill: {
        id: skill.id,
        skillName: skill.skillName,
        category: skill.category,
        description: skill.description,
        skillLevel: skill.skillLevel,
        language: skill.language,
        learningMode: skill.learningMode,
        availableDays: skill.availableDays,
        availableTimes: skill.availableTimes,
        targetLearners: skill.targetLearners,
        generalArea: skill.owner.privacyAreaVisible ? skill.generalArea : 'Safe local area',
        createdDate: skill.createdDate,
        isOwner,
        isSaved,
        rating: averageRating,
        reviewCount,
        learnersHelped: skill.connections.length,
        owner: {
          id: skill.owner.id,
          name: skill.owner.name,
          profilePhoto: skill.owner.profilePhoto,
          bio: skill.owner.bio,
          location: skill.owner.privacyAreaVisible ? skill.owner.location : 'Area hidden by user',
          languages: skill.owner.languages,
          experience: skill.owner.experience,
          verificationStatus: skill.owner.verificationStatus,
          totalHelpedAcrossAllSkills: skill.owner.connectionsAsUser1.length,
        },
        reviews: skill.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          reviewText: r.reviewText,
          isHelpful: r.isHelpful,
          createdDate: r.createdDate,
          reviewer: r.reviewer,
        })),
      },
    });
  } catch (error: any) {
    console.error('getSkillById error:', error);
    res.status(500).json({ success: false, message: 'Failed to load skill details.' });
  }
};

export const createSkill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      skillName,
      category,
      description,
      skillLevel,
      language,
      learningMode,
      availableDays,
      availableTimes,
      targetLearners,
      generalArea,
    } = req.body;

    if (!skillName || !skillName.trim()) {
      res.status(400).json({ success: false, message: 'Skill name is required.' });
      return;
    }

    if (!category || !category.trim()) {
      res.status(400).json({ success: false, message: 'Category is required.' });
      return;
    }

    if (!description || description.trim().length < 15) {
      res.status(400).json({ success: false, message: 'Please provide a descriptive explanation (at least 15 characters).' });
      return;
    }

    if (!skillLevel) {
      res.status(400).json({ success: false, message: 'Skill level is required.' });
      return;
    }

    if (!language) {
      res.status(400).json({ success: false, message: 'Language of instruction is required.' });
      return;
    }

    if (!learningMode) {
      res.status(400).json({ success: false, message: 'Learning mode (Online / In-Person / Both) is required.' });
      return;
    }

    const newSkill = await prisma.skill.create({
      data: {
        ownerId: req.user.id,
        skillName: skillName.trim(),
        category: category.trim(),
        description: description.trim(),
        skillLevel: skillLevel.trim(),
        language: language.trim(),
        learningMode: learningMode.trim(),
        availableDays: availableDays ? availableDays.trim() : 'Flexible / By mutual arrangement',
        availableTimes: availableTimes ? availableTimes.trim() : 'Flexible',
        targetLearners: targetLearners ? targetLearners.trim() : 'Anyone interested in learning',
        generalArea: generalArea ? generalArea.trim() : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Skill shared successfully! It is now visible to the community.',
      skill: newSkill,
    });
  } catch (error: any) {
    console.error('createSkill error:', error);
    res.status(500).json({ success: false, message: 'Failed to create skill.' });
  }
};

export const updateSkill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const skill = await prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found.' });
      return;
    }

    if (skill.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You can only edit your own shared skills.' });
      return;
    }

    const {
      skillName,
      category,
      description,
      skillLevel,
      language,
      learningMode,
      availableDays,
      availableTimes,
      targetLearners,
      generalArea,
    } = req.body;

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        skillName: skillName !== undefined ? skillName.trim() : undefined,
        category: category !== undefined ? category.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        skillLevel: skillLevel !== undefined ? skillLevel.trim() : undefined,
        language: language !== undefined ? language.trim() : undefined,
        learningMode: learningMode !== undefined ? learningMode.trim() : undefined,
        availableDays: availableDays !== undefined ? availableDays.trim() : undefined,
        availableTimes: availableTimes !== undefined ? availableTimes.trim() : undefined,
        targetLearners: targetLearners !== undefined ? targetLearners.trim() : undefined,
        generalArea: generalArea !== undefined ? generalArea.trim() : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully.',
      skill: updatedSkill,
    });
  } catch (error: any) {
    console.error('updateSkill error:', error);
    res.status(500).json({ success: false, message: 'Failed to update skill.' });
  }
};

export const deleteSkill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const skill = await prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found.' });
      return;
    }

    if (skill.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'You are not authorized to delete this skill.' });
      return;
    }

    await prisma.skill.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Skill deleted successfully.' });
  } catch (error: any) {
    console.error('deleteSkill error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete skill.' });
  }
};

export const getSkillOfTheDay = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const allSkills = await prisma.skill.findMany({
      where: {
        owner: { isSuspended: false },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            verificationStatus: true,
            location: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
        connections: {
          where: { status: 'Completed' },
          select: { id: true },
        },
      },
    });

    if (allSkills.length === 0) {
      res.status(200).json({
        success: true,
        skill: null,
        message: 'No skills shared yet today.',
      });
      return;
    }

    // Deterministic selection based on current day of the year
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const selectedIndex = dayOfYear % allSkills.length;
    const chosen = allSkills[selectedIndex];

    const reviewCount = chosen.reviews.length;
    const totalRating = chosen.reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 5.0;

    res.status(200).json({
      success: true,
      skill: {
        id: chosen.id,
        skillName: chosen.skillName,
        category: chosen.category,
        description: chosen.description,
        skillLevel: chosen.skillLevel,
        language: chosen.language,
        learningMode: chosen.learningMode,
        generalArea: chosen.generalArea,
        owner: chosen.owner,
        rating: averageRating,
        reviewCount,
        learnersHelped: chosen.connections.length,
      },
    });
  } catch (error: any) {
    console.error('getSkillOfTheDay error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve skill of the day.' });
  }
};

export const getNearbySkills = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { area } = req.query;

    if (!area || typeof area !== 'string' || !area.trim()) {
      res.status(400).json({ success: false, message: 'Please provide a general area/city name.' });
      return;
    }

    const skills = await prisma.skill.findMany({
      where: {
        generalArea: { contains: area.trim() },
        learningMode: { in: ['In-Person', 'Both'] },
        owner: { isSuspended: false },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            verificationStatus: true,
            privacyAreaVisible: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
        connections: {
          where: { status: 'Completed' },
          select: { id: true },
        },
      },
      take: 20,
    });

    const formatted = skills.map((skill) => {
      const reviewCount = skill.reviews.length;
      const totalRating = skill.reviews.reduce((acc, r) => acc + r.rating, 0);
      return {
        id: skill.id,
        skillName: skill.skillName,
        category: skill.category,
        description: skill.description,
        skillLevel: skill.skillLevel,
        generalArea: skill.owner.privacyAreaVisible ? skill.generalArea : 'Safe local area',
        owner: skill.owner,
        rating: reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 5.0,
        learnersHelped: skill.connections.length,
      };
    });

    res.status(200).json({ success: true, skills: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve nearby skills.' });
  }
};

export const toggleSaveSkill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { skillId } = req.body;
    if (!skillId) {
      res.status(400).json({ success: false, message: 'Skill ID is required.' });
      return;
    }

    const existing = await prisma.savedSkill.findUnique({
      where: {
        userId_skillId: {
          userId: req.user.id,
          skillId,
        },
      },
    });

    if (existing) {
      await prisma.savedSkill.delete({
        where: { id: existing.id },
      });
      res.status(200).json({ success: true, isSaved: false, message: 'Skill removed from your saved list.' });
    } else {
      await prisma.savedSkill.create({
        data: {
          userId: req.user.id,
          skillId,
        },
      });
      res.status(200).json({ success: true, isSaved: true, message: 'Skill saved to your learning list!' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to toggle saved skill.' });
  }
};

export const getSavedSkills = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const saved = await prisma.savedSkill.findMany({
      where: { userId: req.user.id },
      include: {
        skill: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                verificationStatus: true,
              },
            },
            reviews: { select: { rating: true } },
            connections: { where: { status: 'Completed' }, select: { id: true } },
          },
        },
      },
      orderBy: { createdDate: 'desc' },
    });

    const formatted = saved.map(s => {
      const reviewCount = s.skill.reviews.length;
      const totalRating = s.skill.reviews.reduce((acc, r) => acc + r.rating, 0);
      return {
        id: s.skill.id,
        skillName: s.skill.skillName,
        category: s.skill.category,
        description: s.skill.description,
        skillLevel: s.skill.skillLevel,
        learningMode: s.skill.learningMode,
        generalArea: s.skill.generalArea,
        owner: s.skill.owner,
        rating: reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 5.0,
        learnersHelped: s.skill.connections.length,
        savedDate: s.createdDate,
      };
    });

    res.status(200).json({ success: true, savedSkills: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load saved skills.' });
  }
};
