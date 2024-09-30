import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Welcome to Uptime Institute AI Chatbot!
        </h1>
        <p className="leading-normal text-muted-foreground">
          The Uptime Institute is a globally recognized organization that focuses on improving data center performance, reliability, and efficiency. It is best known for its “Tier Standard,” which provides a set of criteria for data center infrastructure design, construction, and operations. These standards range from Tier I (basic capacity) to Tier IV (fault-tolerant systems), ensuring different levels of operational sustainability and redundancy. 
        </p>
      </div>
    </div>
  )
}
