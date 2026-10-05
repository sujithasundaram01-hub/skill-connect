import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getMyConnections = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { user1Id: req.user.id },
          { user2Id: req.user.id },
        ],
      },
      include: {
        skill: {
          select: {
            id: true,
            skillName: true,
            category: true,
            learningMode: true,
          },
        },
        user1: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
            verificationStatus: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
            verificationStatus: true,
          },
        },
        reviews: {
          select: {
            id: true,
            reviewerId: true,
            rating: true,
          },
        },
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedDate: 'desc' },
    });

    const formatted = connections.map((conn) => {
      const isTeacher = conn.user1Id === req.user!.id;
      const partner = isTeacher ? conn.user2 : conn.user1;
      const myReview = conn.reviews.find(r => r.reviewerId === req.user!.id);
      const lastMessage = conn.messages[0] || null;

      return {
        id: conn.id,
        status: conn.status,
        startedDate: conn.startedDate,
        completedDate: conn.completedDate,
        skill: conn.skill,
        isTeacher,
        partner,
        hasReviewed: !!myReview,
        myReviewRating: myReview ? myReview.rating : null,
        lastMessage: lastMessage ? {
          message: lastMessage.message,
          timestamp: lastMessage.timestamp,
          isMine: lastMessage.senderId === req.user!.id,
          readStatus: lastMessage.readStatus,
        } : null,
      };
    });

    res.status(200).json({ success: true, connections: formatted });
  } catch (error: any) {
    console.error('getMyConnections error:', error);
    res.status(500).json({ success: false, message: 'Failed to load connections.' });
  }
};

export const getConnectionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const connection = await prisma.connection.findUnique({
      where: { id },
      include: {
        skill: true,
        user1: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
            verificationStatus: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
            verificationStatus: true,
          },
        },
        reviews: true,
      },
    });

    if (!connection) {
      res.status(404).json({ success: false, message: 'Connection not found.' });
      return;
    }

    if (connection.user1Id !== req.user.id && connection.user2Id !== req.user.id) {
      res.status(403).json({ success: false, message: 'You are not authorized to view this connection.' });
      return;
    }

    const isTeacher = connection.user1Id === req.user.id;
    const partner = isTeacher ? connection.user2 : connection.user1;
    const myReview = connection.reviews.find(r => r.reviewerId === req.user!.id);

    res.status(200).json({
      success: true,
      connection: {
        id: connection.id,
        status: connection.status,
        startedDate: connection.startedDate,
        completedDate: connection.completedDate,
        skill: connection.skill,
        isTeacher,
        partner,
        hasReviewed: !!myReview,
        myReviewRating: myReview ? myReview.rating : null,
      },
    });
  } catch (error: any) {
    console.error('getConnectionById error:', error);
    res.status(500).json({ success: false, message: 'Failed to load connection details.' });
  }
};

export const updateConnectionStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body; // 'Started', 'Learning', 'Completed'

    if (!['Started', 'Learning', 'Completed'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid connection status.' });
      return;
    }

    const connection = await prisma.connection.findUnique({
      where: { id },
    });

    if (!connection) {
      res.status(404).json({ success: false, message: 'Connection not found.' });
      return;
    }

    if (connection.user1Id !== req.user.id && connection.user2Id !== req.user.id) {
      res.status(403).json({ success: false, message: 'You are not authorized to update this connection.' });
      return;
    }

    const completedDate = status === 'Completed' ? new Date() : connection.completedDate;

    const updated = await prisma.connection.update({
      where: { id },
      data: {
        status,
        completedDate,
      },
    });

    // Also update any matching LearningProgress
    await prisma.learningProgress.updateMany({
      where: { connectionId: id },
      data: {
        status,
        completedDate: status === 'Completed' ? completedDate : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: `Learning status successfully updated to "${status}".`,
      connection: updated,
    });
  } catch (error: any) {
    console.error('updateConnectionStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update connection status.' });
  }
};
