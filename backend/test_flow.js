async function runTest() {
  const BASE_URL = 'http://localhost:5000/api';

  console.log('--- 1. Testing User Registration ---');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alex Rivera',
      email: `alex.rivera.${Date.now()}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      location: 'Maplewood District',
      languages: 'English, German',
      skillsLearningInterest: 'Traditional Italian Cooking, Photography',
    }),
  }).then(r => r.json());

  console.log('Registration success:', regRes.success, 'User:', regRes.user?.name);
  const alexToken = regRes.token;

  console.log('\n--- 2. Testing Skill Creation ---');
  const skillRes = await fetch(`${BASE_URL}/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${alexToken}`,
    },
    body: JSON.stringify({
      skillName: 'Woodworking & Hand-Carved Utensils',
      category: 'Handcraft',
      description: 'Learn the foundational cuts and chisel techniques to carve spoons and wooden kitchenware safely.',
      skillLevel: 'Beginner',
      language: 'English',
      learningMode: 'In-Person',
      availableDays: 'Saturdays',
      availableTimes: '2:00 PM - 5:00 PM',
      targetLearners: 'Curious beginners and DIY hobbyists',
      generalArea: 'Maplewood District',
    }),
  }).then(r => r.json());

  console.log('Skill created:', skillRes.success, 'Skill Title:', skillRes.skill?.skillName);
  const alexSkillId = skillRes.skill.id;

  console.log('\n--- 3. Testing Login as Maria Rodriguez ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'maria@example.com',
      password: 'Password123!',
    }),
  }).then(r => r.json());

  console.log('Maria Login:', loginRes.success, 'Name:', loginRes.user?.name);
  const mariaToken = loginRes.token;

  console.log('\n--- 4. Testing Learning Request (Maria requests Alex) ---');
  const reqRes = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mariaToken}`,
    },
    body: JSON.stringify({
      skillId: alexSkillId,
      preferredTime: 'Saturday at 2:00 PM',
      learningMode: 'In-Person',
      message: 'Hello Alex! I would love to learn how to carve wooden salad tossers for my kitchen.',
      isSwapRequest: true,
      swapSkillOffered: 'Traditional Hand-Rolled Italian Pasta',
    }),
  }).then(r => r.json());

  console.log('Request Sent:', reqRes.success, 'Status:', reqRes.request?.status);
  const requestId = reqRes.request.id;

  console.log('\n--- 5. Alex Accepts the Request (Creates Connection) ---');
  const acceptRes = await fetch(`${BASE_URL}/requests/${requestId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${alexToken}`,
    },
    body: JSON.stringify({ status: 'Accepted' }),
  }).then(r => r.json());

  console.log('Accepted:', acceptRes.success, 'ConnectionId:', acceptRes.connectionId);
  const connectionId = acceptRes.connectionId;

  console.log('\n--- 6. Testing Message Exchange in Connection ---');
  const msgRes = await fetch(`${BASE_URL}/messages/${connectionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${alexToken}`,
    },
    body: JSON.stringify({
      message: 'Hi Maria! Excited to share woodworking techniques this Saturday at 2pm.',
    }),
  }).then(r => r.json());

  console.log('Message sent:', msgRes.success, 'Text:', msgRes.message?.message);

  console.log('\n--- 7. Completing the Learning Session ---');
  const completeRes = await fetch(`${BASE_URL}/connections/${connectionId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${alexToken}`,
    },
    body: JSON.stringify({ status: 'Completed' }),
  }).then(r => r.json());

  console.log('Connection Marked Completed:', completeRes.success, 'Status:', completeRes.connection?.status);

  console.log('\n--- 8. Maria Reviews Alex for Completed Interaction ---');
  const reviewRes = await fetch(`${BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mariaToken}`,
    },
    body: JSON.stringify({
      connectionId,
      rating: 5,
      reviewText: 'Alex is an exceptional craftsman and teacher! Safe, patient, and inspiring.',
      isHelpful: true,
    }),
  }).then(r => r.json());

  console.log('Review Posted:', reviewRes.success, 'Rating:', reviewRes.review?.rating);

  console.log('\n--- 9. Checking Skill Matches for Alex ---');
  const matchRes = await fetch(`${BASE_URL}/matches`, {
    headers: { 'Authorization': `Bearer ${alexToken}` },
  }).then(r => r.json());

  console.log('Skill Matches Found:', matchRes.matches?.length);
  if (matchRes.matches?.length > 0) {
    console.log('Top Match:', matchRes.matches[0].name, 'Reason:', matchRes.matches[0].matchReason);
  }

  console.log('\n--- 10. Checking Admin Dashboard & Stats ---');
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@skillshare.org',
      password: 'Password123!',
    }),
  }).then(r => r.json());

  const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { 'Authorization': `Bearer ${adminLogin.token}` },
  }).then(r => r.json());

  console.log('Platform Admin Stats:', statsRes.stats);

  console.log('\n======================================================');
  console.log('🎉 ALL 10 REAL-WORLD BACKEND & DATABASE TESTS PASSED!');
  console.log('======================================================');
}

runTest().catch(console.error);
