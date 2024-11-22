'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { Chat } from '@/lib/types'
import { saveChat } from '@/app/actions'
import { addMessage } from '@/lib/redux/slice/chat.slice'
import { useDispatch, useSelector } from 'react-redux'
import OpenAI from 'openai'

const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
const openAIAssistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const router = useRouter()
  const openai = new OpenAI({
    apiKey: openAIApiKey,
    dangerouslyAllowBrowser: true
  })
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const dispatch = useDispatch()
  const messages = useSelector((state: any) => state.chat.messages)

  async function submitUserMessage(chatId: string, value: string) {
    const createdAt = new Date()
    const path = `/chat/${chatId}`
    const firstMessageContent = value as string
    const title = firstMessageContent.substring(0, 100)

    const chat: Chat = {
      id: chatId,
      title,
      createdAt,
      path
    }
    await saveChat(chat)

    const emptyThread = await openai.beta.threads.create()

    await openai.beta.threads.messages.create(emptyThread.id, {
      role: 'user',
      content: value
    })

    const stream = await openai.beta.threads.runs.stream(emptyThread.id, {
      assistant_id: openAIAssistantId || '',
      stream: true
    })

    let assistantResponse = ''
    const newAssistantChatId = nanoid()

    for await (const message of stream) {
      if (
        message.event === 'thread.message.delta' &&
        message.data.delta.content
      ) {
        const text = (message.data.delta.content[0] as any).text.value
          ? (message.data.delta.content[0] as any).text.value
          : ''
        assistantResponse += text

        dispatch(
          addMessage({
            id: newAssistantChatId,
            message: assistantResponse,
            role: 'assistant'
          })
        )
      }
    }

    // final update after the stream ends
    dispatch(
      addMessage({
        id: newAssistantChatId,
        message: assistantResponse,
        role: 'assistant'
      })
    )

    return {
      id: chatId,
      message: value,
      role: 'user'
    }
  }

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()
        const chatId = nanoid()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        dispatch(addMessage({ id: chatId, message: value, role: 'user' }))

        // Submit and get response message
        await submitUserMessage(chatId, value)
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
              onClick={() => {
                router.push('/new')
              }}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-0 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === ''}>
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
