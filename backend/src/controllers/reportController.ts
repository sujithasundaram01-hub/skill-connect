import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { reportedUserId, reportedSkillId, reason, description } = req.body;

    if (!reason || !reason.trim()) {
      res.status(400).json({ success: false, message: 'Please select a reason for reporting.' });
      return;
    }

    if (!description || description.trim().length < 5) {
      res.status(400).json({ success: false, message: 'Please provide some details for the report (at least 5 characters).' });
      return;
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        reportedUserId: reportedUserId || null,
        reportedSkillId: reportedSkillId || null,
        reason: reason.trim(),
        description: description.trim(),
        status: 'Pending',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Your report has been safely submitted to our community moderation team. Thank you for keeping Skill Share safe!',
      report,
    });
  } catch (error: any) {
    console.error('createReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit report.' });
  }
};
