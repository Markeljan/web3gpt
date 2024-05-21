import type { NextRequest } from "next/server"

import { openai } from "@/lib/openai"

// download file by file ID
export async function GET(req: NextRequest, { params: { fileId } }: { params: { fileId: string } }) {
  const [file, fileContent] = await Promise.all([openai.files.retrieve(fileId), openai.files.content(fileId)])
  return new Response(fileContent.body, {
    headers: {
      "Content-Disposition": `attachment; filename="${file.filename}"`
    }
  })
}
