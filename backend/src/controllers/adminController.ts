import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getAdminStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalSkills,
      totalRequests,
      totalConnections,
      totalCompletedLessons,
      totalReviews,
      totalReports,
      pendingReportsCount,
      suspendedUsersCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.skill.count(),
      prisma.learningRequest.count(),
      prisma.connection.count(),
      prisma.connection.count({ where: { status: 'Completed' } }),
      prisma.review.count(),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'Pending' } }),
      prisma.user.count({ where: { isSuspended: true } }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSkills,
        totalRequests,
        totalConnections,
        totalCompletedLessons,
        totalReviews,
        totalReports,
        pendingReportsCount,
        suspendedUsersCount,
      },
    });
  } catch (error: any) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin stats.' });
  }
};

export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status && status !== 'All') {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            isSuspended: true,
          },
        },
        reportedSkill: {
          select: {
            id: true,
            skillName: true,
            category: true,
          },
        },
      },
      orderBy: { createdDate: 'desc' },
    });

    res.status(200).json({ success: true, reports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
};

export const updateReportStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['Pending', 'Reviewed', 'Dismissed', 'ActionTaken'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid report status.' });
      return;
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes ? adminNotes.trim() : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: `Report marked as ${status}.`,
      report: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update report.' });
  }
};

export const toggleUserSuspension = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { suspend } = req.body;

    if (userId === req.user?.id) {
      res.status(400).json({ success: false, message: 'Administrators cannot suspend their own account.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: Boolean(suspend) },
    });

    res.status(200).json({
      success: true,
      message: updated.isSuspended ? 'User account has been suspended.' : 'User account has been reactivated.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        isSuspended: updated.isSuspended,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to modify user suspension.' });
  }
};

export const getAllUsersAdmin = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verificationStatus: true,
        isSuspended: true,
        createdDate: true,
        _count: {
          select: {
            skills: true,
            reportsReceived: true,
          },
        },
      },
      orderBy: { createdDate: 'desc' },
      take: 50,
    });

    res.status(200).json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};
