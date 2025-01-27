import React from 'react'

import { Button } from '@/components/ui/button'
import { IconClose } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import FileLayout from './file-layout'

interface FilePreviewProps {
  file: File | null
  previewUrl: string | null
  onRemove: () => void
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  previewUrl,
  onRemove
}) => {
  if (!file) return null

  return (
    <div className="relative flex items-center justify-center gap-2 mt-4 sm:rounded-md sm:border bg-background max-w-fit">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="absolute top-0 right-0 sm:rounded-full sm:border bg-foreground text-background w-5 h-5 z-10 transform -translate-y-1/2 translate-x-1/2"
          >
            {' '}
            <IconClose className="w-2 h-2" />
            <span className="sr-only">Remove file</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove file</TooltipContent>
      </Tooltip>

      <FileLayout
        fileType={file.type}
        name={file.name}
        previewUrl={previewUrl}
      />
    </div>
  )
}

export default FilePreview
