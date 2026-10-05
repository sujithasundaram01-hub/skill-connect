import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Skill Share database with realistic community data...');

  // Clean existing tables (in reverse order of foreign keys)
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.learningProgress.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.learningRequest.deleteMany();
  await prisma.savedSkill.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Elena Vance (Admin)',
      email: 'admin@skillshare.org',
      passwordHash,
      role: 'ADMIN',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
      bio: 'Platform moderator and community steward. Here to help keep Skill Share safe, welcoming, and helpful.',
      location: 'Central Community Hub',
      languages: 'English, French',
      verificationStatus: true,
      skillsLearningInterest: 'Pottery, Handcraft, Public Speaking',
    },
  });

  // 2. Maria Rodriguez - Cooking
  const maria = await prisma.user.create({
    data: {
      name: 'Maria Rodriguez',
      email: 'maria@example.com',
      passwordHash,
      role: 'USER',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
      bio: 'Lifelong home cook and grandmother passionate about sharing traditional culinary techniques and family recipes.',
      location: 'Maplewood District',
      languages: 'English, Spanish',
      experience: '20+ years of passionate home cooking and baking',
      skillsLearningInterest: 'Smartphone Photography, Balcony Gardening',
      verificationStatus: true,
    },
  });

  // 3. Marcus Chen - Photography
  const marcus = await prisma.user.create({
    data: {
      name: 'Marcus Chen',
      email: 'marcus@example.com',
      passwordHash,
      role: 'USER',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      bio: 'Nature and event photographer who loves teaching composition, lighting, and smartphone photography tricks.',
      location: 'Riverdale Heights',
      languages: 'English, Mandarin',
      experience: '8 years freelance photography & community workshops',
      skillsLearningInterest: 'Homemade Italian Cooking, Sourdough Baking',
      verificationStatus: true,
    },
  });

  // 4. Evelyn Reed - Tailoring & Handcraft
  const evelyn = await prisma.user.create({
    data: {
      name: 'Evelyn Reed',
      email: 'evelyn@example.com',
      passwordHash,
      role: 'USER',
      profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
      bio: 'Retired garment artisan. I teach people how to mend, alter, sew zippers, and create custom clothing pieces.',
      location: 'Old Town Heritage',
      languages: 'English',
      experience: '25 years custom tailoring and embroidery',
      skillsLearningInterest: 'Conversational Spanish, Computer Basics',
      verificationStatus: true,
    },
  });

  // 5. David Kim - Coding
  const david = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'david@example.com',
      passwordHash,
      role: 'USER',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
      bio: 'Software engineer who believes anyone can learn to build websites and automate daily tasks with Python.',
      location: 'Tech Valley / Downtown',
      languages: 'English, Korean',
      experience: '7 years building software and mentoring newcomers',
      skillsLearningInterest: 'Acoustic Guitar, Home Cooking',
      verificationStatus: true,
    },
  });

  // 6. Priya Patel - Gardening
  const priya = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'priya@example.com',
      passwordHash,
      role: 'USER',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
      bio: 'Urban micro-farmer and terrace gardener. I teach soil health, container gardening, and composting in small spaces.',
      location: 'Greenwood Park',
      languages: 'English, Hindi, Gujarati',
      experience: '6 years running a community organic rooftop garden',
      skillsLearningInterest: 'Tailoring, Garment Mending',
      verificationStatus: true,
    },
  });

  // 7. Carlos Mendez - Languages
  const carlos = await prisma.user.create({
    data: {
      name: 'Carlos Mendez',
      email: 'carlos@example.com',
      passwordHash,
      role: 'USER',
      profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&crop=face',
      bio: 'Friendly native Spanish speaker helping adults conquer spoken conversational Spanish for travel and everyday life.',
      location: 'Westside Arts District',
      languages: 'Spanish, English',
      experience: '5 years informal language exchange & cultural tutoring',
      skillsLearningInterest: 'Coding & Web Design, Smartphone Photography',
      verificationStatus: true,
    },
  });

  // 8. Sarah Jenkins - Music
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      passwordHash,
      role: 'USER',
      profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
      bio: 'Folk musician and acoustic guitarist. I help absolute beginners play their favorite songs within weeks.',
      location: 'East End Harbor',
      languages: 'English',
      experience: '10 years playing and teaching acoustic guitar',
      skillsLearningInterest: 'Urban Gardening, Spanish',
      verificationStatus: true,
    },
  });

  // Create Skills
  const pastaSkill = await prisma.skill.create({
    data: {
      ownerId: maria.id,
      skillName: 'Traditional Hand-Rolled Italian Pasta & Classic Sauces',
      category: 'Cooking',
      description: 'Learn the timeless art of kneading, rolling, and cutting fresh tagliatelle and ravioli from scratch using basic kitchen staples. We also cover rich tomato basil marinara and genuine cacio e pepe.',
      skillLevel: 'Beginner',
      language: 'English',
      learningMode: 'Both',
      availableDays: 'Saturdays, Sunday afternoons',
      availableTimes: '11:00 AM - 2:00 PM',
      targetLearners: 'Anyone who loves good food and wants to cook from scratch with confidence.',
      generalArea: 'Maplewood District',
      isFeatured: true,
    },
  });

  const photoSkill = await prisma.skill.create({
    data: {
      ownerId: marcus.id,
      skillName: 'Smartphone Photography: Composition, Natural Light & Editing',
      category: 'Photography',
      description: 'You do not need an expensive camera to take stunning photos! Learn the rule of thirds, how to harness golden hour lighting, capture sharp portraits, and edit cleanly on your phone.',
      skillLevel: 'Beginner',
      language: 'English',
      learningMode: 'Online',
      availableDays: 'Tuesday & Thursday evenings',
      availableTimes: '6:30 PM - 8:30 PM',
      targetLearners: 'Curious individuals, parents, and hobbyists wanting memorable photos.',
      generalArea: 'Riverdale Heights',
      isFeatured: true,
    },
  });

  const tailorSkill = await prisma.skill.create({
    data: {
      ownerId: evelyn.id,
      skillName: 'Garment Mending, Hemming & Essential Tailoring Alterations',
      category: 'Handcraft',
      description: 'Save money and extend your wardrobe! Hands-on guidance on fixing torn seams, replacing zippers, adjusting waistbands, and hemming pants and dresses both by hand and simple machine.',
      skillLevel: 'Beginner',
      language: 'English',
      learningMode: 'In-Person',
      availableDays: 'Wednesday mornings, Saturdays',
      availableTimes: '10:00 AM - 1:00 PM',
      targetLearners: 'Anyone tired of fast fashion who wants practical lifelong sewing skills.',
      generalArea: 'Old Town Heritage',
      isFeatured: true,
    },
  });

  const pythonSkill = await prisma.skill.create({
    data: {
      ownerId: david.id,
      skillName: 'Python for Beginners & Practical Daily Automation',
      category: 'Technology',
      description: 'Step-by-step introduction to programming with Python. No prior coding experience required. We write simple scripts to organize files, clean Excel sheets, and scrape useful web data.',
      skillLevel: 'Beginner',
      language: 'English',
      learningMode: 'Online',
      availableDays: 'Monday & Wednesday evenings, Weekends',
      availableTimes: '7:00 PM - 9:00 PM',
      targetLearners: 'Adults and beginners wanting to demystify coding for fun or work efficiency.',
      generalArea: 'Tech Valley / Downtown',
      isFeatured: true,
    },
  });

  const gardenSkill = await prisma.skill.create({
    data: {
      ownerId: priya.id,
      skillName: 'Balcony & Windowsill Herb & Vegetable Gardening',
      category: 'Gardening',
      description: 'Turn even a small sunny window or balcony into a thriving mini-garden. Learn pot sizing, organic soil mixes, natural pest prevention, and harvesting fresh herbs year-round.',
      skillLevel: 'All Levels',
      language: 'English',
      learningMode: 'Both',
      availableDays: 'Sunday mornings, Friday afternoons',
      availableTimes: '9:00 AM - 12:00 PM',
      targetLearners: 'Apartment dwellers and nature lovers looking for fresh greens at home.',
      generalArea: 'Greenwood Park',
      isFeatured: true,
    },
  });

  const spanishSkill = await prisma.skill.create({
    data: {
      ownerId: carlos.id,
      skillName: 'Everyday Conversational Spanish: Speak with Confidence',
      category: 'Languages',
      description: 'Forget dry grammar drills. We practice real conversational dialogues for travel, dining, family conversations, and greeting neighbors with correct pronunciation and slang.',
      skillLevel: 'Beginner',
      language: 'Spanish',
      learningMode: 'Both',
      availableDays: 'Tuesday, Thursday, Saturday',
      availableTimes: '5:00 PM - 7:00 PM',
      targetLearners: 'Travelers, beginners, and cultural enthusiasts who want to speak naturally.',
      generalArea: 'Westside Arts District',
      isFeatured: false,
    },
  });

  const guitarSkill = await prisma.skill.create({
    data: {
      ownerId: sarah.id,
      skillName: 'Acoustic Guitar Essentials & Favorite Song Chord Progressions',
      category: 'Music',
      description: 'Learn fundamental open chords, strumming patterns, and how to change chords smoothly. By the end of our sessions you will be playing complete songs to sing along with.',
      skillLevel: 'Beginner',
      language: 'English',
      learningMode: 'Both',
      availableDays: 'Monday afternoons, Saturday afternoons',
      availableTimes: '2:00 PM - 5:00 PM',
      targetLearners: 'Beginners of all ages who have a guitar collecting dust in the closet.',
      generalArea: 'East End Harbor',
      isFeatured: false,
    },
  });

  // Create Completed Connection between Maria & Marcus for authentic review demonstration
  const completedConn = await prisma.connection.create({
    data: {
      user1Id: maria.id,    // Teacher: Maria
      user2Id: marcus.id,   // Learner: Marcus
      skillId: pastaSkill.id,
      status: 'Completed',
      startedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Authentic Review from Marcus to Maria
  await prisma.review.create({
    data: {
      reviewerId: marcus.id,
      reviewedUserId: maria.id,
      connectionId: completedConn.id,
      skillId: pastaSkill.id,
      rating: 5,
      reviewText: 'Maria is an incredible teacher! She was patient, kind, and explained pasta texture in a way no YouTube video ever could. My family was amazed by the ravioli we made together.',
      isHelpful: true,
      createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Another completed connection for Priya (Gardening)
  const completedConn2 = await prisma.connection.create({
    data: {
      user1Id: priya.id,
      user2Id: david.id,
      skillId: gardenSkill.id,
      status: 'Completed',
      startedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.review.create({
    data: {
      reviewerId: david.id,
      reviewedUserId: priya.id,
      connectionId: completedConn2.id,
      skillId: gardenSkill.id,
      rating: 5,
      reviewText: 'Priya helped me rescue my balcony tomato and basil plants! Her advice on soil moisture and sun positioning was spot on. Highly recommended teacher.',
      isHelpful: true,
      createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Create an Active Connection between Marcus & Maria (Marcus teaches Photography to Maria)
  const activeConn = await prisma.connection.create({
    data: {
      user1Id: marcus.id,
      user2Id: maria.id,
      skillId: photoSkill.id,
      status: 'Learning',
      startedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Real messages in active connection
  await prisma.message.create({
    data: {
      connectionId: activeConn.id,
      senderId: marcus.id,
      receiverId: maria.id,
      message: 'Hi Maria! Welcome to the photography learning session. What phone or camera are you planning to use?',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      readStatus: true,
    },
  });

  await prisma.message.create({
    data: {
      connectionId: activeConn.id,
      senderId: maria.id,
      receiverId: marcus.id,
      message: 'Hello Marcus! I am using an iPhone 13. I really want to take appetizing photos of my baked breads and dishes.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      readStatus: true,
    },
  });

  await prisma.message.create({
    data: {
      connectionId: activeConn.id,
      senderId: marcus.id,
      receiverId: maria.id,
      message: 'That iPhone camera is fantastic for food! Next session we will practice side-lighting near your kitchen window. Talk to you on Saturday!',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      readStatus: true,
    },
  });

  // Seed a Pending Learning Request from Evelyn to Carlos for Spanish
  await prisma.learningRequest.create({
    data: {
      requesterId: evelyn.id,
      skillOwnerId: carlos.id,
      skillId: spanishSkill.id,
      preferredTime: 'Saturday mornings, 10:00 AM',
      learningMode: 'Online',
      message: 'Hola Carlos! I am preparing for a trip to visit family in Mexico and would love to practice basic conversation.',
      status: 'Pending',
      isSwapRequest: true,
      swapSkillOffered: 'Custom Tailoring & Mending',
    },
  });

  // Seed Saved Skills
  await prisma.savedSkill.create({
    data: {
      userId: david.id,
      skillId: guitarSkill.id,
    },
  });

  await prisma.savedSkill.create({
    data: {
      userId: maria.id,
      skillId: tailorSkill.id,
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('👤 Admin: admin@skillshare.org / Password123!');
  console.log('👥 Demo users: maria@example.com, marcus@example.com, etc. / Password123!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
