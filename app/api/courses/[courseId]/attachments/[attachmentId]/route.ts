import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string; attachmentId: string } }
) {
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

    const attachment = await db.attachment.delete({
      where: {
        id: params.attachmentId,
        courseId: params.courseId
      }
    });

    return NextResponse.json(attachment);
  } catch (e) {
    console.log('[COURSE_ID_ATTACHMENT_ID_DELETE]');
    return new NextResponse('Internal Error', { status: 500 });
  }
}
