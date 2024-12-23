import React from 'react'

import { IconCSV, IconPDF, IconXLS } from '@/components/ui/icons'

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
      {fileType.startsWith('image/') && previewUrl ? (
        <div className="w-32 h-32 sm:rounded-md z-0">
          <img
            src={previewUrl}
            alt="File Preview"
            className="w-32 h-32 object-cover sm:rounded-md sm:border sm:bg-background sm:shadow-md"
          />
        </div>
      ) : fileType.startsWith('application/pdf') ? (
        <div className="flex flex-row m-4 gap-2 items-center">
          <IconPDF className="w-8 h-8" />
          <div className="flex flex-col align-start">
            <span className="text-sm">{name || fileType}</span>
            <span className="text-xs text-muted-foreground">PDF</span>
          </div>
        </div>
      ) : fileType.startsWith('text/csv') ? (
        <div className="flex flex-row m-4 gap-2 items-center">
          <IconCSV className="w-8 h-8" />
          <div className="flex flex-col align-start">
            <span className="text-sm">{name || fileType}</span>
            <span className="text-xs text-muted-foreground">CSV</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-row m-4 gap-2 items-center">
          <IconXLS className="w-8 h-8" />
          <div className="flex flex-col align-start">
            <span className="text-sm">{name || fileType}</span>
            <span className="text-xs text-muted-foreground">Spreadsheet</span>
          </div>
        </div>
      )}
    </>
  )
}

export default FileLayout
