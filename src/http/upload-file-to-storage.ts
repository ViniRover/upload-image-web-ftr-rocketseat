import axios from 'axios'

export type UploadFileToStorageParams = {
    file: File
    onProgress: (sizyInBytes: number) => void
}

export type UploadFileToStorageOptions = {
    signal?: AbortSignal
}

export async function uploadFileToStorage(
    { file, onProgress }: UploadFileToStorageParams, 
    options?: UploadFileToStorageOptions
) {
    const data = new FormData()

    data.append('file', file)
    const response = await axios.post<{ url: string }>('http://localhost:3333/uploads', data, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        signal: options?.signal,
        onUploadProgress(progressEvent) {
            onProgress(progressEvent.loaded)
        }
    })

    return { url: response.data.url }
}
