import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth();
    const { list } = await req.json();

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId
      }
    });
    if (!courseOwner) return new NextResponse('Unauthorized', { status: 401 });

    for (let item of list) {
      await db.chapter.update({
        where: {
          id: item.id
        },
        data: {
          position: item.position
        }
      });
    }

    return new NextResponse('Success', { status: 200 });
  } catch (e) {
    console.log('[COURSE_ID_CHAPTERS_REORDER_PUT]', e);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
