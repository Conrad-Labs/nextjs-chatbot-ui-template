import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { IconBrackets } from '@/components/ui/icons'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Citation } from '@/lib/types'

function CitationsPopover({ citations }: { citations: Citation[] }) {
  if (!citations || (citations && citations.length === 0)) return

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 p-3 mt-4 bg-muted-background"
          onClick={() => setIsPopoverOpen(false)}
        >
          <IconBrackets className="text-foreground" />
          <span className="text-foreground">
            {isPopoverOpen ? 'Hide Sources' : 'Show Sources'}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={8}
        className="p-6 w-[25rem] h-[15rem] overflow-y-auto bg-background shadow-md rounded-md"
      >
        <div className="gap-y-2">
          <h5 className="font-semibold text-md mb-4">Citations:</h5>
          <div className="gap-y-1 text-sm">
            {citations.map(citation => (
              <div
                key={citation.index}
                className="flex flex-col p-2 rounded-lg"
                tabIndex={0}
              >
                <span>
                  <span className="text-bold">[{citation.index}] </span>
                  <span> {citation.text.slice(2, -2)}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Source: {citation.file_name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default CitationsPopover
