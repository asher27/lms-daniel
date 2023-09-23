import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId
      }
    });
    if (!courseOwner) return new NextResponse('Unauthorized', { status: 401 });

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId
      }
    });
    if (!course) return new NextResponse('Course Not Found', { status: 404 });

    const unpublishedCourse = await db.course.update({
      where: {
        id: params.courseId,
        userId
      },
      data: {
        isPublished: false
      }
    });

    return NextResponse.json(unpublishedCourse);
  } catch (e) {
    console.log('[COURSE_ID_UNPUBLISH_PATCH]', e);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
