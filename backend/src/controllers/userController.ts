import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { calculateUserBadges } from '../utils/badgeCalculator.js';

export const getPublicProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        skills: {
          select: {
            id: true,
            skillName: true,
            category: true,
            description: true,
            skillLevel: true,
            language: true,
            learningMode: true,
            generalArea: true,
            createdDate: true,
          }
        },
        receivedReviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
              }
            },
            skill: {
              select: {
                id: true,
                skillName: true,
              }
            }
          },
          orderBy: { createdDate: 'desc' },
        },
        connectionsAsUser1: {
          where: { status: 'Completed' },
          select: { id: true },
        },
        connectionsAsUser2: {
          where: { status: 'Completed' },
          select: { id: true },
        },
      },
    });

    if (!user || user.isSuspended) {
      res.status(404).json({ success: false, message: 'User profile not found or inactive.' });
      return;
    }

    // Check if current user is blocked by profile owner or vice versa
    let isBlocked = false;
    let hasBlocked = false;
    if (currentUserId && currentUserId !== id) {
      const blockRecords = await prisma.block.findMany({
        where: {
          OR: [
            { blockerId: currentUserId, blockedUserId: id },
            { blockerId: id, blockedUserId: currentUserId },
          ]
        }
      });
      isBlocked = blockRecords.some(b => b.blockerId === id);
      hasBlocked = blockRecords.some(b => b.blockerId === currentUserId);
    }

    // Calculate rating and badges
    const totalRatings = user.receivedReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = user.receivedReviews.length > 0 ? Number((totalRatings / user.receivedReviews.length).toFixed(1)) : 5.0;
    const totalCompleted = user.connectionsAsUser1.length + user.connectionsAsUser2.length;

    const badges = calculateUserBadges({
      skillsCount: user.skills.length,
      completedLearningsCount: totalCompleted,
      reviewsCount: user.receivedReviews.length,
      averageRating: avgRating,
      connectionsCount: totalCompleted,
    });

    const isOwnProfile = currentUserId === user.id;

    // Respect privacy settings for external visitors
    const locationToDisplay = (user.privacyAreaVisible || isOwnProfile) ? user.location : 'Area hidden by user';

    res.status(200).json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        location: locationToDisplay,
        languages: user.languages,
        experience: user.experience,
        skillsLearningInterest: user.skillsLearningInterest,
        verificationStatus: user.verificationStatus,
        createdDate: user.createdDate,
        isOwnProfile,
        isBlocked,
        hasBlocked,
        badges,
        stats: {
          skillsShared: user.skills.length,
          learnersHelped: user.connectionsAsUser1.length,
          skillsLearned: user.connectionsAsUser2.length,
          averageRating: avgRating,
          reviewCount: user.receivedReviews.length,
        },
        skills: user.skills,
        reviews: user.receivedReviews.map(r => ({
          id: r.id,
          rating: r.rating,
          reviewText: r.reviewText,
          isHelpful: r.isHelpful,
          createdDate: r.createdDate,
          reviewer: r.reviewer,
          skillName: r.skill.skillName,
        })),
      },
    });
  } catch (error: any) {
    console.error('getPublicProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to load user profile.' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, bio, location, languages, experience, profilePhoto, privacyAreaVisible, privacyProfilePublic, skillsLearningInterest } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        bio: bio !== undefined ? bio.trim() : undefined,
        location: location !== undefined ? location.trim() : undefined,
        languages: languages !== undefined ? languages.trim() : undefined,
        experience: experience !== undefined ? experience.trim() : undefined,
        profilePhoto: profilePhoto !== undefined ? profilePhoto : undefined,
        privacyAreaVisible: privacyAreaVisible !== undefined ? Boolean(privacyAreaVisible) : undefined,
        privacyProfilePublic: privacyProfilePublic !== undefined ? Boolean(privacyProfilePublic) : undefined,
        skillsLearningInterest: skillsLearningInterest !== undefined ? skillsLearningInterest.trim() : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePhoto: updatedUser.profilePhoto,
        bio: updatedUser.bio,
        location: updatedUser.location,
        languages: updatedUser.languages,
        experience: updatedUser.experience,
        skillsLearningInterest: updatedUser.skillsLearningInterest,
        role: updatedUser.role,
        verificationStatus: updatedUser.verificationStatus,
        privacyAreaVisible: updatedUser.privacyAreaVisible,
        privacyProfilePublic: updatedUser.privacyProfilePublic,
        createdDate: updatedUser.createdDate,
      },
    });
  } catch (error: any) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Please provide current and new passwords.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ success: false, message: 'New passwords do not match.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password does not match records.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error: any) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};

export const blockUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { userIdToBlock } = req.body;
    if (!userIdToBlock || userIdToBlock === req.user.id) {
      res.status(400).json({ success: false, message: 'Invalid user to block.' });
      return;
    }

    await prisma.block.upsert({
      where: {
        blockerId_blockedUserId: {
          blockerId: req.user.id,
          blockedUserId: userIdToBlock,
        }
      },
      create: {
        blockerId: req.user.id,
        blockedUserId: userIdToBlock,
      },
      update: {},
    });

    res.status(200).json({ success: true, message: 'User has been blocked. They will not be able to message you.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to block user.' });
  }
};

export const unblockUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { userIdToUnblock } = req.body;
    if (!userIdToUnblock) {
      res.status(400).json({ success: false, message: 'Invalid user ID.' });
      return;
    }

    await prisma.block.deleteMany({
      where: {
        blockerId: req.user.id,
        blockedUserId: userIdToUnblock,
      }
    });

    res.status(200).json({ success: true, message: 'User unblocked successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to unblock user.' });
  }
};

export const getBlockedUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const blocks = await prisma.block.findMany({
      where: { blockerId: req.user.id },
      include: {
        blockedUser: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      blockedUsers: blocks.map(b => b.blockedUser),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load blocked users.' });
  }
};

export const requestVerification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Community trust verification: mark as verified with friendly note
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { verificationStatus: true },
    });

    res.status(200).json({
      success: true,
      message: 'Profile verified! Trust badge updated.',
      verificationStatus: updated.verificationStatus,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update verification.' });
  }
};
