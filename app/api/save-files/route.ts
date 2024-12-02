import { auth } from '@/auth'
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    debugger
    const { searchParams } = new URL(request.url)
    const session = await auth()
    const chatId = searchParams.get('chatId')
    const filename = searchParams.get('filename')
    const userId = searchParams.get('userId')
    const file = await request.body
    const currUser = session?.user?.id

    if (chatId && filename && userId && file && userId) {
      if (currUser === userId) {
        const blob = await put(
          `user:${userId}/chat:${chatId}/${filename}`,
          file,
          {
            access: 'public'
          }
        )
        return NextResponse.json(blob)
      } else {
        return NextResponse.json({ status: 401, message: 'Unauthorized' })
      }
    } else {
      const message = `chat id is : ${chatId}. filename is ${filename}. user id is ${userId} and file is ${file}`
      return NextResponse.json({ status: 400, error: 'Bad request' })
    }
  } catch (error) {
    return NextResponse.json({ status: 500, message: error })
  }
}
