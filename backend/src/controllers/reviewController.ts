import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { connectionId, rating, reviewText, isHelpful } = req.body;

    if (!connectionId) {
      res.status(400).json({ success: false, message: 'Connection ID is required.' });
      return;
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5 stars.' });
      return;
    }

    if (!reviewText || reviewText.trim().length < 5) {
      res.status(400).json({ success: false, message: 'Please provide a brief review (at least 5 characters).' });
      return;
    }

    // Verify connection exists
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: { skill: true },
    });

    if (!connection) {
      res.status(404).json({ success: false, message: 'Learning connection not found.' });
      return;
    }

    // Must be a participant
    if (connection.user1Id !== req.user.id && connection.user2Id !== req.user.id) {
      res.status(403).json({ success: false, message: 'You were not a participant in this learning exchange.' });
      return;
    }

    // ONLY users who have completed the interaction can review!
    if (connection.status !== 'Completed') {
      res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after the learning session is marked Completed.',
      });
      return;
    }

    // Check if user already reviewed this connection
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewerId_connectionId: {
          reviewerId: req.user.id,
          connectionId,
        },
      },
    });

    if (existingReview) {
      res.status(409).json({ success: false, message: 'You have already submitted a review for this completed session.' });
      return;
    }

    const reviewedUserId = connection.user1Id === req.user.id ? connection.user2Id : connection.user1Id;

    const newReview = await prisma.review.create({
      data: {
        reviewerId: req.user.id,
        reviewedUserId,
        connectionId,
        skillId: connection.skillId,
        rating: numericRating,
        reviewText: reviewText.trim(),
        isHelpful: isHelpful !== undefined ? Boolean(isHelpful) : true,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your genuine review has been posted and helps build community trust.',
      review: newReview,
    });
  } catch (error: any) {
    console.error('createReview error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

export const getReviewsForUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { reviewedUserId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
        skill: {
          select: {
            id: true,
            skillName: true,
          },
        },
      },
      orderBy: { createdDate: 'desc' },
    });

    const totalRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = reviews.length > 0 ? Number((totalRatings / reviews.length).toFixed(1)) : 5.0;
    const positiveReviewsCount = reviews.filter(r => r.rating >= 4).length;

    res.status(200).json({
      success: true,
      reviews,
      stats: {
        totalReviews: reviews.length,
        averageRating,
        positiveReviewsCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to load reviews.' });
  }
};
