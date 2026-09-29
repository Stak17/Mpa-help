import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // In production, verify auth token.
  // Return live system metrics, user tiers, feature distribution
  const metrics = {
    totalUsers: 142,
    activeUsersToday: 48,
    totalAiRequests: 1390,
    planDistribution: {
      free: 118,
      plus: 19,
      business: 5,
    },
    savedDocumentsCount: 387,
    feedbackCount: 64,
    feedbackPositiveRatio: 94, // 94% positive
    featureUsage: [
      { name: 'Ask Mpa Help', requests: 520, percentage: 37 },
      { name: 'Write Something', requests: 380, percentage: 27 },
      { name: 'My Money', requests: 210, percentage: 15 },
      { name: 'Find Work & CV', requests: 160, percentage: 12 },
      { name: 'Grow My Business', requests: 80, percentage: 6 },
      { name: 'Translate', requests: 40, percentage: 3 },
    ],
    recentRegistrations: [
      { id: 'usr_1', email: 'katongole.b@gmail.com', plan: 'plus', date: '2026-09-29' },
      { id: 'usr_2', email: 'namubiru.sarah@yahoo.com', plan: 'free', date: '2026-09-29' },
      { id: 'usr_3', email: 'mukasa.hardware@gmail.com', plan: 'business', date: '2026-09-28' },
      { id: 'usr_4', email: 'asiimwe.john@gmail.com', plan: 'free', date: '2026-09-28' },
    ],
    systemHealth: 'optimal',
    geminiLatencyAvgMs: 820,
  };

  return NextResponse.json(metrics);
}
