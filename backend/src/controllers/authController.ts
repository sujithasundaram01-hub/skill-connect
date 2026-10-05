import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { calculateUserBadges } from '../utils/badgeCalculator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'skillshare_super_secret_jwt_key_2025_community_safe_production_ready';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword, profilePhoto, bio, location, languages, experience, skillsLearningInterest } = req.body;

    // Validation
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Full name is required.' });
      return;
    }

    if (!email || !email.trim()) {
      res.status(400).json({ success: false, message: 'Valid email address is required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Please enter a valid email format.' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        profilePhoto: profilePhoto || null,
        bio: bio ? bio.trim() : 'Enthusiastic community learner and skill sharer.',
        location: location ? location.trim() : null,
        languages: languages ? languages.trim() : 'English',
        experience: experience ? experience.trim() : null,
        skillsLearningInterest: skillsLearningInterest ? skillsLearningInterest.trim() : null,
        role: 'USER',
        verificationStatus: false,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      profilePhoto: newUser.profilePhoto,
      bio: newUser.bio,
      location: newUser.location,
      languages: newUser.languages,
      experience: newUser.experience,
      skillsLearningInterest: newUser.skillsLearningInterest,
      role: newUser.role,
      verificationStatus: newUser.verificationStatus,
      privacyAreaVisible: newUser.privacyAreaVisible,
      privacyProfilePublic: newUser.privacyProfilePublic,
      createdDate: newUser.createdDate,
    };

    res.status(201).json({
      success: true,
      message: 'Account successfully registered! Welcome to Skill Share.',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ success: false, message: 'This account has been suspended by community moderation.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      location: user.location,
      languages: user.languages,
      experience: user.experience,
      skillsLearningInterest: user.skillsLearningInterest,
      role: user.role,
      verificationStatus: user.verificationStatus,
      privacyAreaVisible: user.privacyAreaVisible,
      privacyProfilePublic: user.privacyProfilePublic,
      createdDate: user.createdDate,
    };

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login. Please try again.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        skills: true,
        receivedReviews: true,
        connectionsAsUser1: true,
        connectionsAsUser2: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const totalRatings = user.receivedReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = user.receivedReviews.length > 0 ? Number((totalRatings / user.receivedReviews.length).toFixed(1)) : 5.0;

    const completedAsTeacher = user.connectionsAsUser1.filter(c => c.status === 'Completed').length;
    const completedAsLearner = user.connectionsAsUser2.filter(c => c.status === 'Completed').length;
    const totalCompleted = completedAsTeacher + completedAsLearner;

    const badges = calculateUserBadges({
      skillsCount: user.skills.length,
      completedLearningsCount: totalCompleted,
      reviewsCount: user.receivedReviews.length,
      averageRating: avgRating,
      connectionsCount: user.connectionsAsUser1.length + user.connectionsAsUser2.length,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      location: user.location,
      languages: user.languages,
      experience: user.experience,
      skillsLearningInterest: user.skillsLearningInterest,
      role: user.role,
      verificationStatus: user.verificationStatus,
      privacyAreaVisible: user.privacyAreaVisible,
      privacyProfilePublic: user.privacyProfilePublic,
      createdDate: user.createdDate,
      badges,
      stats: {
        skillsShared: user.skills.length,
        learnersHelped: completedAsTeacher,
        skillsLearned: completedAsLearner,
        averageRating: avgRating,
        reviewCount: user.receivedReviews.length,
      },
    };

    res.status(200).json({ success: true, user: safeUser });
  } catch (error: any) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Please provide an email address.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      // Security best practice: don't reveal if email exists, but return friendly confirmation
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been generated.',
      });
      return;
    }

    // In local development / community demo without SMTP configured, return an immediate confirmation with simulated secure token
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email. (In demo environment: use password update from your profile settings or contact community support).',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error processing password reset request.' });
  }
};
