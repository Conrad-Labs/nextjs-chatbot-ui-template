import React, { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { IconAttachment, IconAddFile } from '@/components/ui/icons'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { FileData } from '@/lib/types'

function FileUploadPopover({
  onFileSelect,
  disabled,
  ...props
}: {
  onFileSelect: (files: FileData[]) => void
  disabled: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = event.target.files
    if (files) {
      const fileDataArray: FileData[] = []
      let filesRead = 0

      Array.from(files).forEach(file => {
        const fileType = file.type.split('/')[0]
        const isImage = fileType === 'image'

        if (isImage) {
          const reader = new FileReader()
          reader.onloadend = () => {
            fileDataArray.push({
              file,
              previewUrl: reader.result as string | null,
              fileType
            })
            filesRead++
            if (filesRead === files.length) {
              onFileSelect(fileDataArray)
              setIsPopoverOpen(false)
            }
          }
          reader.readAsDataURL(file)
        } else {
          fileDataArray.push({ file, previewUrl: null, fileType })
          filesRead++
          if (filesRead === files.length) {
            onFileSelect(fileDataArray)
            setIsPopoverOpen(false)
          }
        }
      })
    }
  }

  return (
    <Popover open={isPopoverOpen && !disabled} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-8 sm:rounded-full bg-background p-0 sm:left-4"
          onClick={() => setIsPopoverOpen(false)}
        >
          <IconAttachment />
          <span className="sr-only">Attach File</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" side="top" sideOffset={8} className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 w-full p-2"
          onClick={handleFileUpload}
        >
          <IconAddFile />
          <span>Upload from computer</span>
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          multiple
        />
      </PopoverContent>
    </Popover>
  )
}

export default FileUploadPopover
