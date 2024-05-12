import { openai } from "@/app/config"
import type { NextRequest } from "next/server"

// download file by file ID
export async function GET(req: NextRequest, { params: { fileId } }: { params: { fileId: string } }) {
  const [file, fileContent] = await Promise.all([openai.files.retrieve(fileId), openai.files.content(fileId)])
  return new Response(fileContent.body, {
    headers: {
      "Content-Disposition": `attachment; filename="${file.filename}"`
    }
  })
}
