import { CoreMessage } from 'ai'
import { ChatMessage } from './redux/slice/chat.slice'

export type Message = CoreMessage & {
  id: string
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId?: string
  path: string
  messages: ChatMessage[]
  sharePath?: string
  threadId: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}
export interface FileData {
  file: File,
  previewUrl: string | null
  name?: string
  fileType: string
}

export interface Citation {
  index: number
  text: string
  file_name: string
  start_index: number
  end_index: number
}