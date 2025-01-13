'use client'

import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  IconAddFile,
  IconFile,
  IconFolder,
  IconSpinner
} from '@/components/ui/icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { DialogDescription, DialogTrigger } from '@radix-ui/react-dialog'
import OpenAI from 'openai'
import { toast } from 'sonner'

const openAIVectorStoreId = process.env.NEXT_PUBLIC_VECTOR_STORE_ID

function VectorStorePopover({
  files,
  openai,
  refreshFiles
}: {
  files: any[]
  openai: OpenAI
  refreshFiles: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<any>(null)

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      try {
        if (openAIVectorStoreId) {
          const purpose = 'assistants'
          const createdFile = await openai.files.create({
            file,
            purpose
          })

          await openai.beta.vectorStores.files.create(openAIVectorStoreId, {
            file_id: createdFile.id
          })

          await refreshFiles()
          const success = `The file ${file.name} has been uploaded to the vector store.`
          console.log(success)
          const title = 'Success!'
          toast.success(title, { description: success })
        } else {
          const error =
            'There was an error adding the file to the vector store. Please try again later'
          console.error(error)
          const title = 'Something went wrong...'
          toast.error(title, { description: error })
        }
      } catch (err) {
        const error = `Error uploading file: ${err}`
        console.error(error)
        const title = 'Something went wrong...'
        toast.error(title, { description: error })
      }
      setIsUploading(false)
      toast.dismiss()
    }
  }

  const handleDeleteRequest = (file: any) => {
    setFileToDelete(file)
    setIsConfirmingDelete(true)
  }

  const handleDeleteFile = async () => {
    if (!fileToDelete) return
    if (!openAIVectorStoreId) return
    try {
      const fileId = fileToDelete.id
      // Delete file from vector store and otherwise
      await openai.beta.vectorStores.files.del(openAIVectorStoreId, fileId)
      await openai.files.del(fileId)

      await refreshFiles()
      const success =
        'The file has been successfully deleted from the vector store.'
      console.log(success)
      const title = 'Success!'
      toast.success(title, { description: success })
    } catch (err) {
      const error = `Error deleting file: ${err}`
      console.error(error)
      const title = 'Something went wrong...'
      toast.error(title, { description: error })
    }
    setFileToDelete(null)
    setIsConfirmingDelete(false)
  }

  const renderFileList = () => {
    if (files.length === 0) {
      return (
        <div className="text-sm text-muted-foreground text-center">
          No files uploaded.
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {files.map(file => (
          <div
            key={file.id}
            className="flex items-center justify-between border border-border rounded-md p-4 shadow-sm bg-background"
          >
            <div className="flex items-center gap-4">
              <IconFile className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-primary">
                  {file.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {`${(file.bytes / 1024).toFixed(2)} KB`}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteRequest(file)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-8 sm:rounded-full bg-background p-0 sm:left-4"
          >
            <IconFolder />
            <span className="sr-only">View Vector Store</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="p-6 rounded-lg shadow-md bg-background">
          <DialogDescription hidden>
            Update the Vector Store Workspace
          </DialogDescription>
          <DialogHeader className="flex justify-center items-center">
            <DialogTitle className="text-lg font-bold mt-2">
              Vector Store Workspace
            </DialogTitle>
          </DialogHeader>

          <div className="p-2">
            <div className="flex flex-row items-center justify-between p-4 pt-0">
              <span className="text-md font-semibold">Existing Files:</span>

              {!isUploading ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 sm:rounded-full bg-background p-0 sm:left-4"
                  onClick={handleFileUpload}
                >
                  <IconAddFile className="size-5" />
                  <span className="sr-only">Upload new file</span>
                </Button>
              ) : (
                <IconSpinner />
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".c,.cpp,.cs,.css,.doc,.docx,.go,.html,.java,.js,.json,.md,.pdf,.php,.pptx,.py,.rb,.sh,.tex,.ts,.txt"
              />
            </div>
            <div className="overflow-y-auto h-[15rem] pr-2">
              {renderFileList()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isConfirmingDelete && (
        <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
          <DialogContent className="p-6 rounded-lg shadow-md bg-background">
            <DialogDescription hidden>
              Add/remove files from the vector store
            </DialogDescription>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-red-600">
                Confirm Delete
              </DialogTitle>
            </DialogHeader>
            <div>
              <span className="text-sm text-muted-foreground">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{fileToDelete?.filename}</span>?
                This action cannot be undone.
              </span>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmingDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteFile}
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default VectorStorePopover
