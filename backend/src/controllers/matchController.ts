import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getSkillMatches = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Get current user details including their shared skills
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        skills: true,
      },
    });

    if (!currentUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const mySkills = currentUser.skills.map(s => s.skillName.toLowerCase().trim());
    const myCategories = currentUser.skills.map(s => s.category.toLowerCase().trim());
    const myLearningInterests = (currentUser.skillsLearningInterest || '')
      .toLowerCase()
      .split(/[,;]/)
      .map(s => s.trim())
      .filter(Boolean);

    // Get other active users with their skills
    const otherUsers = await prisma.user.findMany({
      where: {
        id: { not: req.user.id },
        isSuspended: false,
      },
      include: {
        skills: {
          include: {
            reviews: { select: { rating: true } },
            connections: { where: { status: 'Completed' }, select: { id: true } },
          },
        },
      },
    });

    const matches: any[] = [];

    for (const other of otherUsers) {
      if (other.skills.length === 0 && !other.skillsLearningInterest) {
        continue;
      }

      const otherLearningInterests = (other.skillsLearningInterest || '')
        .toLowerCase()
        .split(/[,;]/)
        .map(s => s.trim())
        .filter(Boolean);

      // Check if they teach what I want to learn
      const theyTeachWhatIWant = other.skills.filter(s => {
        const name = s.skillName.toLowerCase();
        const cat = s.category.toLowerCase();
        return myLearningInterests.some(interest => 
          name.includes(interest) || interest.includes(name) || cat.includes(interest)
        );
      });

      // Check if I teach what they want to learn
      const ITeachWhatTheyWant = currentUser.skills.filter(s => {
        const name = s.skillName.toLowerCase();
        const cat = s.category.toLowerCase();
        return otherLearningInterests.some(interest =>
          name.includes(interest) || interest.includes(name) || cat.includes(interest)
        );
      });

      // Check mutual category overlap
      const mutualCategory = other.skills.filter(s => 
        myCategories.includes(s.category.toLowerCase())
      );

      let matchScore = 0;
      let matchReason = '';
      let matchType = 'Interest Match';

      if (theyTeachWhatIWant.length > 0 && ITeachWhatTheyWant.length > 0) {
        // Perfect 2-way Swap!
        matchScore = 100;
        matchType = 'Perfect Skill Swap';
        matchReason = `Two-Way Match! They teach "${theyTeachWhatIWant[0].skillName}" which you want, and they want to learn "${ITeachWhatTheyWant[0].skillName}" which you teach.`;
      } else if (theyTeachWhatIWant.length > 0) {
        matchScore = 75;
        matchType = 'Learning Match';
        matchReason = `They can teach "${theyTeachWhatIWant[0].skillName}", which matches your learning interests.`;
      } else if (ITeachWhatTheyWant.length > 0) {
        matchScore = 65;
        matchType = 'Teaching Opportunity';
        matchReason = `They want to learn "${ITeachWhatTheyWant[0].skillName}", which is a skill you actively share.`;
      } else if (currentUser.location && other.location && currentUser.location.toLowerCase() === other.location.toLowerCase()) {
        matchScore = 45;
        matchType = 'Local Neighbor';
        matchReason = `Located in your area (${other.location}) with shared community skills.`;
      } else if (other.skills.length > 0) {
        matchScore = 30;
        matchType = 'Community Sharer';
        matchReason = `Active community member offering ${other.skills[0].skillName}.`;
      }

      if (matchScore > 0) {
        const bestSkill = theyTeachWhatIWant[0] || other.skills[0] || null;
        matches.push({
          userId: other.id,
          name: other.name,
          profilePhoto: other.profilePhoto,
          verificationStatus: other.verificationStatus,
          generalArea: other.privacyAreaVisible ? (other.location || 'Local Community') : 'Area hidden',
          skillTheyTeach: bestSkill ? {
            id: bestSkill.id,
            skillName: bestSkill.skillName,
            category: bestSkill.category,
            skillLevel: bestSkill.skillLevel,
            learningMode: bestSkill.learningMode,
            rating: bestSkill.reviews && bestSkill.reviews.length > 0 
              ? Number((bestSkill.reviews.reduce((a: number, c: any) => a + c.rating, 0) / bestSkill.reviews.length).toFixed(1))
              : 5.0,
            learnersHelped: bestSkill.connections ? bestSkill.connections.length : 0,
          } : null,
          skillTheyWantToLearn: other.skillsLearningInterest || 'Open to learning new skills',
          skillYouCanTeachThem: ITeachWhatTheyWant.length > 0 ? ITeachWhatTheyWant[0].skillName : (currentUser.skills[0]?.skillName || null),
          matchScore,
          matchType,
          matchReason,
        });
      }
    }

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      matches,
      myProfile: {
        skillsCount: currentUser.skills.length,
        learningInterests: currentUser.skillsLearningInterest,
      },
    });
  } catch (error: any) {
    console.error('getSkillMatches error:', error);
    res.status(500).json({ success: false, message: 'Failed to find skill matches.' });
  }
};
