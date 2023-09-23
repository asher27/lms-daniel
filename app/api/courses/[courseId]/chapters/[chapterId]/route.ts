import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import Mux from '@mux/mux-node';

const { Video } = new Mux(process.env.MUX_TOKEN_ID!, process.env.MUX_TOKEN_SECRET!);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { isPublished, ...values } = await req.json();

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId
      }
    });
    if (!courseOwner) return new NextResponse('Unauthorized', { status: 401 });

    const chapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId
      },
      data: {
        ...values
      }
    });

    // handle video upload
    if (values.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId
        }
      });
      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id
          }
        });
      }

      const asset = await Video.Assets.create({
        input: values.videoUrl,
        playback_policy: 'public',
        test: false
      });
      await db.muxData.create({
        data: {
          chapterId: params.chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id
        }
      });
    }

    return NextResponse.json(chapter);
  } catch (e) {
    console.log('[COURSE_ID_CHAPTER_ID_PATCH]', e);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
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

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId
      }
    });
    if (!chapter) return new NextResponse('Chapter Not Found', { status: 404 });
    if (chapter.videoUrl) {
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId
        }
      });
      if (existingMuxData) {
        await Video.Assets.del(existingMuxData.assetId);
        await db.muxData.delete({
          where: {
            id: existingMuxData.id
          }
        });
      }
    }

    const deletedChapter = await db.chapter.delete({
      where: {
        id: params.chapterId
      }
    });

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true
      }
    });
    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId
        },
        data: {
          isPublished: false
        }
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (e) {
    console.log('[COURSE_ID_CHAPTER_ID_DELETE]', e);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
