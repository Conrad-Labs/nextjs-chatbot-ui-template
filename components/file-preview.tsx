import React from 'react'

import { Button } from '@/components/ui/button'
import { IconClose, IconPDF } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

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

      {file.type.startsWith('image/') && previewUrl ? (
        <div className="w-16 h-16 overflow-hidden sm:rounded-md z-0">
          <img
            src={previewUrl}
            alt="File Preview"
            className="w-16 h-16 object-cover sm:rounded-md"
          />
        </div>
      ) : (
        <div className="flex flex-row m-4 gap-2 items-center">
          <IconPDF className="w-8 h-8" />
          <div className="flex flex-col align-start">
            <span className="text-sm">{file.name}</span>
            <span className="text-xs text-muted-foreground">{file.type}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilePreview
