export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface UserStats {
  skillsShared: number;
  learnersHelped: number;
  skillsLearned: number;
  averageRating: number;
  reviewCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  bio?: string | null;
  location?: string | null;
  languages?: string | null;
  experience?: string | null;
  skillsLearningInterest?: string | null;
  role: 'USER' | 'ADMIN';
  verificationStatus: boolean;
  privacyAreaVisible?: boolean;
  privacyProfilePublic?: boolean;
  createdDate: string;
  badges?: Badge[];
  stats?: UserStats;
}

export interface Skill {
  id: string;
  skillName: string;
  category: string;
  description: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  language: string;
  learningMode: 'Online' | 'In-Person' | 'Both';
  availableDays?: string | null;
  availableTimes?: string | null;
  targetLearners?: string | null;
  generalArea?: string | null;
  createdDate: string;
  isSaved?: boolean;
  isOwner?: boolean;
  rating: number;
  reviewCount: number;
  learnersHelped: number;
  owner: {
    id: string;
    name: string;
    profilePhoto?: string | null;
    bio?: string | null;
    location?: string | null;
    languages?: string | null;
    experience?: string | null;
    verificationStatus: boolean;
    totalHelpedAcrossAllSkills?: number;
  };
  reviews?: Review[];
}

export interface LearningRequest {
  id: string;
  requesterId: string;
  skillOwnerId: string;
  skillId: string;
  preferredTime: string;
  learningMode: string;
  message?: string | null;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Cancelled' | 'Completed';
  isSwapRequest: boolean;
  swapSkillOffered?: string | null;
  createdDate: string;
  skill: {
    id: string;
    skillName: string;
    category: string;
    learningMode?: string;
  };
  skillOwner?: {
    id: string;
    name: string;
    profilePhoto?: string | null;
    location?: string | null;
    verificationStatus: boolean;
  };
  requester?: {
    id: string;
    name: string;
    profilePhoto?: string | null;
    bio?: string | null;
    location?: string | null;
    verificationStatus: boolean;
  };
  connection?: {
    id: string;
    status: string;
  } | null;
}

export interface Connection {
  id: string;
  status: 'Started' | 'Learning' | 'Completed';
  startedDate: string;
  completedDate?: string | null;
  isTeacher: boolean;
  hasReviewed: boolean;
  myReviewRating?: number | null;
  partner: {
    id: string;
    name: string;
    profilePhoto?: string | null;
    location?: string | null;
    verificationStatus: boolean;
  };
  skill: {
    id: string;
    skillName: string;
    category: string;
    learningMode: string;
  };
  lastMessage?: {
    message: string;
    timestamp: string;
    isMine: boolean;
    readStatus: boolean;
  } | null;
}

export interface Message {
  id: string;
  connectionId: string;
  senderId: string;
  receiverId: string;
  message: string;
  readStatus: boolean;
  timestamp: string;
  isMine: boolean;
  senderName: string;
  senderPhoto?: string | null;
}

export interface Review {
  id: string;
  rating: number;
  reviewText: string;
  isHelpful: boolean;
  createdDate: string;
  reviewer: {
    id: string;
    name: string;
    profilePhoto?: string | null;
  };
  skillName?: string;
}

export interface SkillMatch {
  userId: string;
  name: string;
  profilePhoto?: string | null;
  verificationStatus: boolean;
  generalArea: string;
  skillTheyTeach: {
    id: string;
    skillName: string;
    category: string;
    skillLevel: string;
    learningMode: string;
    rating: number;
    learnersHelped: number;
  } | null;
  skillTheyWantToLearn: string;
  skillYouCanTeachThem: string | null;
  matchScore: number;
  matchType: string;
  matchReason: string;
}

export interface PlatformReport {
  id: string;
  reason: string;
  description: string;
  status: 'Pending' | 'Reviewed' | 'Dismissed' | 'ActionTaken';
  adminNotes?: string | null;
  createdDate: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser?: {
    id: string;
    name: string;
    email: string;
    isSuspended: boolean;
  } | null;
  reportedSkill?: {
    id: string;
    skillName: string;
    category: string;
  } | null;
}
