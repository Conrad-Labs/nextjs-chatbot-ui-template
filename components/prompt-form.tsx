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
import OpenAI from "openai";

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
  const messages = useSelector((state:any) => state.chat.messages)

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

    // const emptyThread = await openai.beta.threads.create();
    // console.log(emptyThread.id);

    const emptyThread = {
      id: "thread_sN57ma9sJMTs2iaJqGZO2vdY"
    }

    const threadMessages = await openai.beta.threads.messages.create(
      emptyThread.id,
      { role: "user", content: value }
    );

    let run = await openai.beta.threads.runs.createAndPoll(
      emptyThread.id,
      { 
        assistant_id: openAIAssistantId || "",
        instructions: `
        You are a course catalogue assistant for Uptime Institute. You are provided multiple files that holds details about the objectives of the CDCDP course, you are supposed to answer all your questions according to the details within the file. 

        ----------------------------------
        ABOUT UPTIME INSTITUTE
        ----------------------------------
        Uptime Institute is an organization that specializes in improving the reliability, efficiency, and performance of critical infrastructure, primarily data centers. It is well known for creating and managing the “Tier Standard” certification system, which is used to rate data centers based on their ability to sustain operations, manage risk, and provide continuous availability.

        -----------------------------------
        Example Questions / Context
        -----------------------------------
        Search for the questions from the attached files, the questions can be in the following format:

        # what is uptime institute
        Uptime Institute is an organization that specializes in improving the reliability, efficiency, and performance of critical infrastructure, primarily data centers.

        # what is the course about
        The Certified Data Centre Design Professional (CDCDP®) course focuses on equipping participants with the expertise to design efficient, reliable, and scalable data center infrastructures.

        # what is the objectives for the course
        The program covers various essential topics, such as power and cooling systems, cabling, security, fire protection, and data center management. It also addresses design considerations from the initial site selection to the implementation phase.
        ---------------------------------------

        If you cant find any match within the files then excuse yourself from any other conversation that is not about uptime institute and CDCDP course. Respond as follows: "I apologize but as Uptime bot I can only guide you regarding the CDCDP course outline and objectives."
        `
      }
    );
    
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(
        run.thread_id
      );

      const newAssistantChatId = nanoid()
      const reversedMessages = messages.data.reverse();
      // @ts-ignore
      const assistantResponse = reversedMessages[reversedMessages.length-1].content[0].text.value;

      dispatch(addMessage({ id: newAssistantChatId, message: assistantResponse, role: 'assistant' })) 
    } else {
      console.error(run.status);
    }
    
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

        dispatch(addMessage({ id:chatId, message: value, role: 'user' }))    

        // Submit and get response message
        const responseMessage = await submitUserMessage(chatId, value)
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
