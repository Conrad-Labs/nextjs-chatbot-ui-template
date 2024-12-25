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
import { Session, FileData, Citation } from '@/lib/types'
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
          const error = `Unable to save uploaded files. Response is ${response}`
          throw new Error(error)
        } else {
          const value = await response.json()
          const success = `Saved uploaded files successfully: `
          console.log(success, value)
          fileBlobs.push({
            filename: file.file.name,
            name: value.pathname,
            previewUrl: value.url,
            type: value.contentType,
            fileObj: file.file,
            downloadUrl: value.downloadUrl
          })
        }
      }
      return fileBlobs
    } catch (e) {
      const error = `Error saving file: ${e}`
      console.error(error)
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

    const { assistantMessageId, assistantResponse, citations } =
      await getAssistantResponse(currentThreadId, value, files)

    const assistantMessage = {
      id: assistantMessageId,
      message: assistantResponse,
      role: Roles.assistant,
      citations
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
    value: string,
    files: any[]
  ) => {
    const fileIds = []
    if (files && files.length > 0) {
      try {
        for (const file of files) {
          const createdFile = await openai.files.create({
            file: file.fileObj,
            purpose: 'assistants'
          })

          if (createdFile && createdFile.id) {
            fileIds.push(createdFile.id)
          } else {
            const error = `An error occurred getting the created file ID for upload: ${createdFile}`
            console.error(error)
          }
        }
      } catch (e) {
        const error = `An error occurred uploading files to the assistant: ${e}`
        console.error(error)
      }
    }
    const valueWithFiles = value || 'Please analyze these files'
    await openai.beta.threads.messages.create(currentThreadId, {
      role: Roles.user,
      content: valueWithFiles,
      attachments: fileIds.map(file_id => {
        return {
          file_id,
          tools: [{ type: 'file_search' }]
        }
      })
    })

    const stream = await openai.beta.threads.runs.stream(currentThreadId, {
      assistant_id: openAIAssistantId || '',
      stream: true
    })

    let assistantResponse = ''
    const newAssistantChatId = nanoid()
    const delta = 'thread.message.delta'
    const completed = 'thread.message.completed'
    let citations: Citation[] = []

    for await (const message of stream) {
      if (message.event === delta && message.data.delta.content) {
        const text = (message.data.delta.content[0] as any).text.value
          ? (message.data.delta.content[0] as any).text.value
          : ''
        assistantResponse += text
        const annotations = (message.data.delta.content[0] as any).text
          .annotations

        if (annotations && annotations.length > 0) {
          for (let annotation of annotations) {
            const trimmedText = annotation.text
            assistantResponse = assistantResponse.replace(
              trimmedText,
              ` [${annotation.index + 1}]`
            )
          }
        }

        dispatch(
          addMessage({
            id: newAssistantChatId,
            message: assistantResponse,
            role: Roles.assistant,
            citations
          })
        )
      } else if (message.event === completed) {
        const text = (message.data.content[0] as any).text
        const { annotations } = text
        let index = 0
        for (let annotation of annotations) {
          const file_info = await openai.files.retrieve(
            annotation.file_citation.file_id
          )
          const file_name = file_info.filename
          const annotation_details = {
            index: index + 1,
            text: `[${annotation.text}]`,
            file_name: file_name,
            start_index: annotation.start_index,
            end_index: annotation.end_index
          }
          citations = [...citations, annotation_details]
          index++
        }
        if (citations.length > 0) {
          assistantResponse += '\n\n'
        }
      }
    }

    dispatch(
      addMessage({
        id: newAssistantChatId,
        message: assistantResponse,
        role: Roles.assistant,
        citations
      })
    )

    return {
      assistantMessageId: newAssistantChatId,
      assistantResponse: assistantResponse,
      citations
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
        const error = 'Chat not found!'
        throw new Error(error)
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
    if (!value && selectedFiles.length === 0) {
      setIsAssistantRunning(false)
      return
    }

    let files: any[] = []
    if (selectedFiles.length === 0) {
      setInput('')
      dispatch(addMessage({ id: messageId, message: value, role: Roles.user }))
    } else {
      const currFiles = selectedFiles.map(fileData => {
        return {
          file: fileData.file,
          name: fileData.name,
          previewUrl: fileData.previewUrl
        } as FileData
      })
      setInput('')
      setSelectedFiles([])
      files = (await saveFiles(currFiles, messageId)) || []
      dispatch(
        addMessage({
          id: messageId,
          message: value,
          role: Roles.user,
          files: JSON.stringify(files)
        })
      )
    }

    // Submit and get response message
    await submitUserMessage(messageId, value, files)
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
