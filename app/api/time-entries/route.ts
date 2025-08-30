import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const timeEntries = await db.collection('timeEntries')
      .find({ userEmail: session.user.email })
      .sort({ startTime: -1 })
      .toArray();

    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, startTime, endTime, duration, description } = body;

    const { db } = await connectToDatabase();
    const timeEntry = {
      taskId,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      duration,
      description,
      userEmail: session.user.email,
    };

    const result = await db.collection('timeEntries').insertOne(timeEntry);
    const newEntry = { ...timeEntry, id: result.insertedId.toString() };

    // Update task total time
    await db.collection('tasks').updateOne(
      { _id: taskId, userEmail: session.user.email },
      { $inc: { totalTime: duration } }
    );

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}