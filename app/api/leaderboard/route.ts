import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get start of current week (Monday)
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Aggregate user productivity for current week
    const leaderboard = await db.collection('timeEntries').aggregate([
      {
        $match: {
          startTime: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: '$userEmail',
          totalTime: { $sum: '$duration' },
          taskCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'email',
          as: 'userInfo'
        }
      },
      {
        $project: {
          email: '$_id',
          name: { $arrayElemAt: ['$userInfo.name', 0] },
          totalTime: 1,
          taskCount: 1,
          avgSessionTime: { $divide: ['$totalTime', '$taskCount'] }
        }
      },
      {
        $sort: { totalTime: -1 }
      },
      {
        $limit: 10
      }
    ]).toArray();

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}