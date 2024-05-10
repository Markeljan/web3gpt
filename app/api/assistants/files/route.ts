import type { NextRequest } from "next/server"

import { OPENAI_ASSISTANT_ID } from "@/app/config"
import { openai } from "@/app/config"

// upload file to assistant's vector store
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file") as File
  const vectorStoreId = await getOrCreateVectorStore()

  if (!file) {
    return new Response("No file found in request", { status: 400 })
  }
  // upload using the file stream
  const openaiFile = await openai.files.create({
    file: file,
    purpose: "assistants"
  })

  // add file to vector store
  await openai.beta.vectorStores.files.create(vectorStoreId, {
    file_id: openaiFile.id
  })
  return new Response()
}

// list files in assistant's vector store
export async function GET() {
  const vectorStoreId = await getOrCreateVectorStore() // get or create vector store
  const fileList = await openai.beta.vectorStores.files.list(vectorStoreId)

  const filesArray = await Promise.all(
    fileList.data.map(async (file) => {
      const fileDetails = await openai.files.retrieve(file.id)
      const vectorFileDetails = await openai.beta.vectorStores.files.retrieve(vectorStoreId, file.id)
      return {
        file_id: file.id,
        filename: fileDetails.filename,
        status: vectorFileDetails.status
      }
    })
  )
  return Response.json(filesArray)
}

// delete file from assistant's vector store
export async function DELETE(request: NextRequest) {
  const body = await request.json()
  const fileId = body.fileId

  const vectorStoreId = await getOrCreateVectorStore() // get or create vector store
  await openai.beta.vectorStores.files.del(vectorStoreId, fileId) // delete file from vector store

  return new Response()
}

/* Helper functions */

const getOrCreateVectorStore = async () => {
  const assistant = await openai.beta.assistants.retrieve(OPENAI_ASSISTANT_ID)
  const vectorStoreIds = assistant.tool_resources?.file_search?.vector_store_ids
  // if the assistant already has a vector store, return it
  if (vectorStoreIds && vectorStoreIds?.length > 0) {
    return vectorStoreIds?.[0]
  }
  // otherwise, create a new vector store and attatch it to the assistant
  const vectorStore = await openai.beta.vectorStores.create({
    name: "default-assistant-vector-store"
  })
  await openai.beta.assistants.update(OPENAI_ASSISTANT_ID, {
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id]
      }
    }
  })
  return vectorStore.id
}
