import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getMessagesByConnection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { connectionId } = req.params;

    // Verify connection exists and user is a participant
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        user1: {
          select: { id: true, name: true, profilePhoto: true },
        },
        user2: {
          select: { id: true, name: true, profilePhoto: true },
        },
        skill: {
          select: { id: true, skillName: true },
        },
      },
    });

    if (!connection) {
      res.status(404).json({ success: false, message: 'Learning connection not found.' });
      return;
    }

    if (connection.user1Id !== req.user.id && connection.user2Id !== req.user.id) {
      res.status(403).json({ success: false, message: 'You are not a participant in this conversation.' });
      return;
    }

    const partnerId = connection.user1Id === req.user.id ? connection.user2Id : connection.user1Id;

    // Check if either user has blocked the other
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: req.user.id, blockedUserId: partnerId },
          { blockerId: partnerId, blockedUserId: req.user.id },
        ],
      },
    });

    // Mark unread messages sent to current user as read
    await prisma.message.updateMany({
      where: {
        connectionId,
        receiverId: req.user.id,
        readStatus: false,
      },
      data: {
        readStatus: true,
      },
    });

    const messages = await prisma.message.findMany({
      where: { connectionId },
      orderBy: { timestamp: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      connection: {
        id: connection.id,
        status: connection.status,
        skill: connection.skill,
        partner: connection.user1Id === req.user.id ? connection.user2 : connection.user1,
      },
      isBlocked: !!isBlocked,
      messages: messages.map((m) => ({
        id: m.id,
        connectionId: m.connectionId,
        senderId: m.senderId,
        receiverId: m.receiverId,
        message: m.message,
        readStatus: m.readStatus,
        timestamp: m.timestamp,
        isMine: m.senderId === req.user!.id,
        senderName: m.sender.name,
        senderPhoto: m.sender.profilePhoto,
      })),
    });
  } catch (error: any) {
    console.error('getMessages error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { connectionId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
      return;
    }

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      res.status(404).json({ success: false, message: 'Connection not found.' });
      return;
    }

    if (connection.user1Id !== req.user.id && connection.user2Id !== req.user.id) {
      res.status(403).json({ success: false, message: 'You are not authorized to send messages in this connection.' });
      return;
    }

    const receiverId = connection.user1Id === req.user.id ? connection.user2Id : connection.user1Id;

    // Check block list
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: req.user.id, blockedUserId: receiverId },
          { blockerId: receiverId, blockedUserId: req.user.id },
        ],
      },
    });

    if (isBlocked) {
      res.status(403).json({
        success: false,
        message: 'Communication is blocked between you and this user.',
      });
      return;
    }

    const newMessage = await prisma.message.create({
      data: {
        connectionId,
        senderId: req.user.id,
        receiverId,
        message: message.trim(),
        readStatus: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
          },
        },
      },
    });

    // Update connection updatedDate so active conversations sort to top
    await prisma.connection.update({
      where: { id: connectionId },
      data: { updatedDate: new Date() },
    });

    res.status(201).json({
      success: true,
      message: {
        id: newMessage.id,
        connectionId: newMessage.connectionId,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: newMessage.message,
        readStatus: newMessage.readStatus,
        timestamp: newMessage.timestamp,
        isMine: true,
        senderName: newMessage.sender.name,
        senderPhoto: newMessage.sender.profilePhoto,
      },
    });
  } catch (error: any) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};
