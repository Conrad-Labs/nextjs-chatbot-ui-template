'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { Button } from '@/components/ui/button'
import { IconArrowElbow } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { Session, FileData } from '@/lib/types'
import { Chat } from '@/lib/types'
import { getChat, saveChat } from '@/app/actions'
import { addMessage, Roles, setThreadId } from '@/lib/redux/slice/chat.slice'
import { useDispatch, useSelector } from 'react-redux'
import OpenAI from 'openai'
import FileUploadPopover from './file-upload-popover'
import FilePreview from './file-preview'

const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
const openAIAssistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID

export function PromptForm({
  input,
  setInput,
  session,
  id
}: {
  input: string
  setInput: (value: string) => void
  session?: Session
  id?: string
}) {
  const openai = new OpenAI({
    apiKey: openAIApiKey,
    dangerouslyAllowBrowser: true
  })
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const dispatch = useDispatch()
  const messages = useSelector((state: any) => state.chat.messages)
  const threadId = useSelector((state: any) => state.chat.threadId)
  const [selectedFiles, setSelectedFiles] = React.useState<FileData[]>([])
  const [isAssistantRunning, setIsAssistantRunning] =
    React.useState<boolean>(false)

  const saveFiles = async (files: FileData[], messageId: string) => {
    const fileBlobs: any[] = []
    try {
      for (const file of files) {
        const response = await fetch(
          `/api/save-files?chatId=${id}&filename=${file.file.name}&userId=${session?.user.id}&messageId=${messageId}`,
          {
            method: 'POST',
            body: file.file
          }
        )

        if (!response.ok) {
          throw new Error(
            `Unable to save uploaded files. Response is ${response}`
          )
        } else {
          const value = await response.json()
          console.log(`Saved uploaded files successfully: ${value}`)
          fileBlobs.push({
            name: value.pathname,
            previewUrl: value.downloadUrl,
            type: value.contentType
          })
        }
      }
      return fileBlobs
    } catch (error) {
      console.error('Error saving file:', error)
    }
  }

  const submitUserMessage = async (
    messageId: string,
    value: string,
    files: any[]
  ) => {
    const { currentThreadId, chat } = await getCurrentChat(
      messageId,
      value,
      files
    )

    const { assistantMessageId, assistantResponse } =
      await getAssistantResponse(currentThreadId, value)

    const assistantMessage = {
      id: assistantMessageId,
      message: assistantResponse,
      role: Roles.assistant
    }

    chat.messages
      ? chat.messages.push(assistantMessage)
      : (chat.messages = [assistantMessage])
    dispatch(addMessage(assistantMessage))

    await saveChat(chat)
    setIsAssistantRunning(false)

    return {
      id: messageId,
      message: value,
      role: Roles.user
    }
  }

  const getAssistantResponse = async (
    currentThreadId: string,
    value: string
  ) => {
    await openai.beta.threads.messages.create(currentThreadId, {
      role: Roles.user,
      content: value
    })

    const stream = await openai.beta.threads.runs.stream(currentThreadId, {
      assistant_id: openAIAssistantId || '',
      stream: true
    })

    let assistantResponse = ''
    const newAssistantChatId = nanoid()
    const event = 'thread.message.delta'

    for await (const message of stream) {
      if (message.event === event && message.data.delta.content) {
        const text = (message.data.delta.content[0] as any).text.value
          ? (message.data.delta.content[0] as any).text.value
          : ''
        assistantResponse += text

        dispatch(
          addMessage({
            id: newAssistantChatId,
            message: assistantResponse,
            role: Roles.assistant
          })
        )
      }
    }

    return {
      assistantMessageId: newAssistantChatId,
      assistantResponse: assistantResponse
    }
  }

  const getCurrentChat = async (
    messageId: string,
    value: string,
    files: any[]
  ) => {
    let currentThreadId = threadId
    let chat: Chat

    if (!threadId) {
      const createdAt = new Date()
      const firstMessageContent = value as string
      const title = firstMessageContent.substring(0, 100)
      const emptyThread = await openai.beta.threads.create()
      dispatch(setThreadId(emptyThread.id))
      currentThreadId = emptyThread.id

      chat = {
        id: id as string,
        title,
        createdAt,
        path: `/chat/${id}`,
        messages: [
          {
            id: messageId,
            message: value,
            role: Roles.user,
            files: JSON.stringify(files)
          }
        ],
        threadId: currentThreadId
      }
    } else {
      chat = (await getChat(id as string, session?.user?.id as string)) as Chat
      if (!chat) {
        throw new Error('Chat not found!')
      }

      chat.messages = [
        ...(chat.messages || []),
        {
          id: messageId,
          role: Roles.user,
          message: value,
          files: JSON.stringify(files)
        }
      ]
      currentThreadId = chat.threadId
    }

    return { currentThreadId, chat }
  }

  const handleFileSelect = (
    files: { file: File; previewUrl: string | null }[]
  ) => {
    setSelectedFiles((prevFiles: any) => [...prevFiles, ...files])
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prevFiles: any[]) =>
      prevFiles.filter((_, i) => i !== index)
    )
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    setIsAssistantRunning(true)
    const messageId = nanoid()

    // Blur focus on mobile
    if (window.innerWidth < 600) {
      event.target['message']?.blur()
    }

    const value = input.trim()
    setInput('')
    if (!value && selectedFiles.length === 0) return

    let files: any[] = []
    if (selectedFiles.length === 0) {
      dispatch(addMessage({ id: messageId, message: value, role: Roles.user }))
    } else {
      const currFiles = selectedFiles.map(fileData => {
        return {
          file: fileData.file,
          name: fileData.name,
          previewUrl: fileData.previewUrl
        } as FileData
      })
      files = (await saveFiles(currFiles, messageId)) || []
      dispatch(
        addMessage({
          id: messageId,
          message: value,
          role: Roles.user,
          files: JSON.stringify(files)
        })
      )
      setSelectedFiles([])
    }

    // Submit and get response message
    const valueWithFiles = value || 'Please look at these files'
    await submitUserMessage(messageId, valueWithFiles, files)
  }

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="relative flex max-h-60 w-full grow flex-col bg-background px-8 sm:rounded-md sm:px-4">
        <div className="flex flex-wrap gap-x-4 mb-2">
          {selectedFiles.map((fileData, index) => (
            <FilePreview
              key={index}
              file={fileData.file}
              previewUrl={fileData.previewUrl}
              onRemove={() => handleRemoveFile(index)}
            />
          ))}
        </div>

        <div className="flex space-between items-center mt-auto">
          <div className="left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4">
            <FileUploadPopover
              onFileSelect={handleFileSelect}
              disabled={isAssistantRunning || messages.length === 1}
            />
          </div>
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
            disabled={isAssistantRunning || messages.length === 1}
          />
          <div className="right-0 top-[13px] sm:right-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    (input === '' && selectedFiles.length === 0) ||
                    isAssistantRunning
                  }
                >
                  <IconArrowElbow />
                  <span className="sr-only">Send message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </form>
  )
}
