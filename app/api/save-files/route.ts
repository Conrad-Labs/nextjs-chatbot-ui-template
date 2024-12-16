import { Error400Response, Error401Response, Error500Response } from '@/app/constants'
import { auth } from '@/auth'
import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const session = await auth()
    const chatId = searchParams.get('chatId')
    const filename = searchParams.get('filename')
    const userId = searchParams.get('userId')
    const file = await request.body
    const currUser = session?.user?.id
    const access = 'public'

    if (chatId && filename && userId && file && userId) {
      if (currUser === userId) {
        const blob = await put(
          `user:${userId}/chat:${chatId}/${filename}`,
          file,
          {
            access
          }
        )
        return NextResponse.json(blob)
      } else {
        return NextResponse.json({ status: Error401Response.status, message: Error401Response.message })
      }
    } else {
      return NextResponse.json({ status: Error400Response.status, error: Error400Response.message })
    }
  } catch (error) {
    return NextResponse.json({ status: Error500Response.status, message: error })
  }
}
