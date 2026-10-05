import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const createRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { skillId, preferredTime, learningMode, message, isSwapRequest, swapSkillOffered } = req.body;

    if (!skillId) {
      res.status(400).json({ success: false, message: 'Skill ID is required.' });
      return;
    }

    if (!preferredTime) {
      res.status(400).json({ success: false, message: 'Please specify your preferred date or times.' });
      return;
    }

    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: { owner: true },
    });

    if (!skill) {
      res.status(404).json({ success: false, message: 'The skill you are requesting was not found.' });
      return;
    }

    if (skill.ownerId === req.user.id) {
      res.status(400).json({ success: false, message: 'You cannot send a learning request to yourself for your own skill.' });
      return;
    }

    // Check block list
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: req.user.id, blockedUserId: skill.ownerId },
          { blockerId: skill.ownerId, blockedUserId: req.user.id },
        ],
      },
    });

    if (isBlocked) {
      res.status(403).json({ success: false, message: 'Unable to send request due to user privacy and safety blocks.' });
      return;
    }

    // Check if there is already a pending request
    const existingPending = await prisma.learningRequest.findFirst({
      where: {
        requesterId: req.user.id,
        skillId,
        status: 'Pending',
      },
    });

    if (existingPending) {
      res.status(409).json({ success: false, message: 'You already have a pending learning request for this skill.' });
      return;
    }

    const learningRequest = await prisma.learningRequest.create({
      data: {
        requesterId: req.user.id,
        skillOwnerId: skill.ownerId,
        skillId: skill.id,
        preferredTime: preferredTime.trim(),
        learningMode: learningMode || skill.learningMode,
        message: message ? message.trim() : null,
        status: 'Pending',
        isSwapRequest: Boolean(isSwapRequest),
        swapSkillOffered: isSwapRequest && swapSkillOffered ? swapSkillOffered.trim() : null,
      },
      include: {
        skill: {
          select: {
            skillName: true,
            category: true,
          },
        },
        skillOwner: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: isSwapRequest 
        ? 'Skill Swap proposal sent successfully! The teacher will review it.'
        : 'Learning request sent successfully! You will be notified once accepted.',
      request: learningRequest,
    });
  } catch (error: any) {
    console.error('createRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to send learning request.' });
  }
};

export const getMySentRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const requests = await prisma.learningRequest.findMany({
      where: { requesterId: req.user.id },
      include: {
        skill: {
          select: {
            id: true,
            skillName: true,
            category: true,
            learningMode: true,
          },
        },
        skillOwner: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
            verificationStatus: true,
          },
        },
        connection: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdDate: 'desc' },
    });

    res.status(200).json({ success: true, requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch sent requests.' });
  }
};

export const getMyReceivedRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const requests = await prisma.learningRequest.findMany({
      where: { skillOwnerId: req.user.id },
      include: {
        skill: {
          select: {
            id: true,
            skillName: true,
            category: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            bio: true,
            location: true,
            verificationStatus: true,
          },
        },
        connection: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdDate: 'desc' },
    });

    res.status(200).json({ success: true, requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch received requests.' });
  }
};

export const updateRequestStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body; // 'Accepted', 'Declined', 'Cancelled'

    if (!['Accepted', 'Declined', 'Cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status update.' });
      return;
    }

    const request = await prisma.learningRequest.findUnique({
      where: { id },
      include: { skill: true },
    });

    if (!request) {
      res.status(404).json({ success: false, message: 'Learning request not found.' });
      return;
    }

    // Authorization checks
    if (status === 'Cancelled') {
      if (request.requesterId !== req.user.id) {
        res.status(403).json({ success: false, message: 'Only the person who made the request can cancel it.' });
        return;
      }
    } else {
      // 'Accepted' or 'Declined'
      if (request.skillOwnerId !== req.user.id) {
        res.status(403).json({ success: false, message: 'Only the skill teacher can accept or decline this request.' });
        return;
      }
    }

    const updatedRequest = await prisma.learningRequest.update({
      where: { id },
      data: { status },
    });

    // If accepted, create a Connection and LearningProgress record
    let connection = null;
    if (status === 'Accepted') {
      // Check if connection already exists
      const existingConn = await prisma.connection.findUnique({
        where: { requestId: id },
      });

      if (!existingConn) {
        connection = await prisma.connection.create({
          data: {
            requestId: id,
            user1Id: request.skillOwnerId, // Teacher
            user2Id: request.requesterId,  // Learner
            skillId: request.skillId,
            status: 'Started',
          },
        });

        // Create learning progress entry
        await prisma.learningProgress.create({
          data: {
            learnerId: request.requesterId,
            skillId: request.skillId,
            connectionId: connection.id,
            status: 'Started',
            notes: request.isSwapRequest 
              ? `Skill Swap session with ${request.swapSkillOffered || 'partner'}`
              : 'Learning connection established',
          },
        });

        // Add welcome message in connection
        await prisma.message.create({
          data: {
            connectionId: connection.id,
            senderId: request.skillOwnerId,
            receiverId: request.requesterId,
            message: `Hi! I accepted your request to learn "${request.skill.skillName}". Feel free to message here to coordinate our learning schedule!`,
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}.`,
      request: updatedRequest,
      connectionId: connection ? connection.id : undefined,
    });
  } catch (error: any) {
    console.error('updateRequestStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update request status.' });
  }
};
