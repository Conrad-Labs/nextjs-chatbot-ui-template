import React from 'react'

import { IconPDF } from '@/components/ui/icons'

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
    <>
      {fileType.startsWith('application/pdf') ? (
        <div className="flex flex-row m-4 gap-2 items-center">
          <IconPDF className="w-8 h-8" />
          <div className="flex flex-col align-start">
            <span className="text-sm">{name || fileType}</span>
            <span className="text-xs text-muted-foreground">PDF</span>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  )
}

export default FileLayout
