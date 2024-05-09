"use client"

import { useState, useEffect } from "react"

import { IconTrash } from "@/components/ui/icons"

export const FileViewer = () => {
  const [files, setFiles] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFiles()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchFiles = async () => {
    const resp = await fetch("/api/assistants/files", {
      method: "GET"
    })
    const data = await resp.json()
    setFiles(data)
  }

  const handleFileDelete = async (fileId: string) => {
    await fetch("/api/assistants/files", {
      method: "DELETE",
      body: JSON.stringify({ fileId })
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const data = new FormData()
    const eventFiles = event.target.files
    if (eventFiles && eventFiles.length > 0) {
      data.append("file", eventFiles[0])
      await fetch("/api/assistants/files", {
        method: "POST",
        body: data
      })
    }
  }

  return (
    <div>
      <div>
        {files?.length === 0 ? (
          <div>Attach files to test file search</div>
        ) : Array.isArray(files) ? (
          files?.map((file: { file_id: string; filename: string; status: string }) => (
            <div key={file.file_id}>
              <div>
                <span>{file.filename}</span>
                <span>{file.status}</span>
              </div>
              <span onClick={() => handleFileDelete(file.file_id)} onKeyDown={() => handleFileDelete(file.file_id)}>
                <IconTrash />
              </span>
            </div>
          ))
        ) : null}
      </div>
      <div>
        <label htmlFor="file-upload">Attach files</label>
        <input type="file" id="file-upload" name="file-upload" multiple onChange={handleFileUpload} />
      </div>
    </div>
  )
}
