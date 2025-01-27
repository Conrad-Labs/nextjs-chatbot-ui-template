import React from 'react'

import { IconPDF } from '@/components/ui/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'

interface FileLayoutProps {
  fileType: string
  name?: string
  previewUrl: string | null
}

const FileLayout: React.FC<FileLayoutProps> = ({
  fileType,
  name,
  previewUrl
}) => {
  if (!fileType) return null

  return (
    <Dialog>
      <DialogTrigger className="flex flex-row items-start gap-2">
        {fileType.startsWith('application/pdf') ? (
          <div className="flex flex-row m-4 gap-2 items-center">
            <IconPDF className="w-8 h-8" />
            <div className="flex flex-col items-start">
              <span className="text-sm">{name || fileType}</span>
              <span className="text-xs text-muted-foreground">PDF</span>
            </div>
          </div>
        ) : (
          <></>
        )}
      </DialogTrigger>
      {previewUrl && (
        <DialogContent className="w-[34rem] h-[28rem] flex flex-col space-between items-center">
          <DialogHeader className="w-full h-auto">
            <DialogTitle className="mb-0">{name}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="w-full h-full">
            <iframe src={previewUrl} className="w-full h-full border-0" />
          </DialogDescription>
        </DialogContent>
      )}
    </Dialog>
  )
}

export default FileLayout
