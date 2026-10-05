export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface UserStatsForBadges {
  skillsCount: number;
  completedLearningsCount: number;
  reviewsCount: number;
  averageRating: number;
  connectionsCount: number;
}

export function calculateUserBadges(stats: UserStatsForBadges): BadgeInfo[] {
  const badges: BadgeInfo[] = [
    {
      id: 'skill_sharer',
      name: 'Skill Sharer',
      description: 'Shared at least one skill with the community',
      icon: 'BookOpen',
      earned: stats.skillsCount >= 1,
    },
    {
      id: 'active_learner',
      name: 'Active Learner',
      description: 'Successfully completed at least one learning interaction',
      icon: 'GraduationCap',
      earned: stats.completedLearningsCount >= 1,
    },
    {
      id: 'helpful_teacher',
      name: 'Helpful Teacher',
      description: 'Maintained a positive community rating (4.0+ stars) on shared skills',
      icon: 'Award',
      earned: stats.reviewsCount >= 1 && stats.averageRating >= 4.0,
    },
    {
      id: 'top_contributor',
      name: 'Top Contributor',
      description: 'High-impact community member with multiple shared skills and completed sessions',
      icon: 'Sparkles',
      earned: stats.skillsCount >= 2 && stats.completedLearningsCount >= 2 && stats.averageRating >= 4.5,
    }
  ];

  return badges;
}
