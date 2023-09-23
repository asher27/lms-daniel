import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import Mux from '@mux/mux-node';

const { Video } = new Mux(process.env.MUX_TOKEN_ID!, process.env.MUX_TOKEN_SECRET!);

export async function PATCH(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const values = await req.json();

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    if (!courseId) return new NextResponse('Course Id required', { status: 404 });

    const course = await db.course.update({
      where: {
        id: courseId,
        userId
      },
      data: {
        ...values
      }
    });
    return NextResponse.json(course);
  } catch (e) {
    console.log('[COURSE_ID_PATCH]', e);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    if (!params.courseId) return new NextResponse('Course Id required', { status: 404 });

    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId
      },
      include: {
        chapters: {
          include: {
            muxData: true
          }
        }
      }
    });
    if (!course) return new NextResponse('Course Not Found', { status: 404 });

    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId) {
        await Video.Assets.del(chapter.muxData.assetId);
      }
    }

    const deletedCourse = await db.course.delete({
      where: {
        id: params.courseId
      }
    });
    return NextResponse.json(deletedCourse);
  } catch (e) {
    console.log('[COURSE_ID_DELETE]', e);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
