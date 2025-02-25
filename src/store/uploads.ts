import { create } from 'zustand'
import { enableMapSet } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { uploadFileToStorage } from '../http/upload-file-to-storage'
import { CanceledError } from 'axios'

export type Upload = {
  name: string
  file: File
  abortController: AbortController
  status: 'progress' | 'success' | 'error' | 'canceled'
  originalSizeInBytes: number
  uploadSizeInBytes: number
}

type UploadsState = {
  uploads: Map<string, Upload>
  addUploads: (files: File[]) => void
  cancelUpload: (uploadId: string) => void
}

enableMapSet()

export const useUploads = create<UploadsState, [['zustand/immer', never]]>(immer((set, get) => {
  async function processUpload(uploadId: string) {
    const upload = get().uploads.get(uploadId)

    if(!upload) return

    try {
      await uploadFileToStorage(
        { 
          file: upload.file,
          onProgress(sizyInBytes) {
            set(state => {
              state.uploads.set(uploadId, {
                ...upload,
                uploadSizeInBytes: sizyInBytes
              })
            })
          }
        }, 
        { signal: upload.abortController.signal }
      )
  
      set(state => {
        state.uploads.set(uploadId, {
          ...upload,
          status: 'success'
        })
      })
    } catch (error) {
      if(error instanceof CanceledError) {
        set(state => {
          state.uploads.set(uploadId, {
            ...upload,
            status: 'canceled'
          })
        })
        
        return
      }

      set(state => {
        state.uploads.set(uploadId, {
          ...upload,
          status: 'error'
        })
      })
    }
  }

  function cancelUpload(uploadId: string) {
    const upload = get().uploads.get(uploadId)

    if(!upload) return

    upload.abortController.abort()
  }

  function addUploads(files: File[]) {
    for(const file of files) {
      const uploadId = crypto.randomUUID();
      const abortController = new AbortController()

      const upload: Upload = {
        name: file.name,
        file,
        abortController,
        originalSizeInBytes: file.size,
        uploadSizeInBytes: 0,
        status: 'progress'
      }

      set(state => {
        state.uploads.set(uploadId, upload)
      })

      processUpload(uploadId)
    }
  }
  
  return {
    uploads: new Map(),
    addUploads,
    cancelUpload
  }
}))