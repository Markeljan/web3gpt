import "server-only"
import { type FileObject, PinataSDK } from "pinata"
import type { SolcOutput } from "solc"
import type { Abi } from "viem"
import { IPFS_W3GPT_GROUP_ID } from "@/lib/constants"

const CURRENT_DIR_PREFIX = "./"
const PARENT_DIR_PREFIX = "../"

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY,
})

function getSafeIpfsFileName(fileName: string) {
  const normalizedFileName = fileName.replaceAll("\\", "/")

  if (normalizedFileName.startsWith(CURRENT_DIR_PREFIX)) {
    return `imports/${normalizedFileName.slice(CURRENT_DIR_PREFIX.length)}`
  }

  if (normalizedFileName.startsWith(PARENT_DIR_PREFIX)) {
    return `imports/${normalizedFileName.replaceAll(PARENT_DIR_PREFIX, "up/")}`
  }

  return normalizedFileName
}

export async function ipfsUploadDir(
  sources: SolcOutput["sources"],
  abi: Abi,
  bytecode: string,
  standardJsonInput: string
): Promise<string | null> {
  try {
    const files: FileObject[] = []

    for (const [fileName, { content }] of Object.entries(sources)) {
      files.push(new File([content], getSafeIpfsFileName(fileName)))
    }
    files.push(new File([JSON.stringify(abi, null, 2)], "abi.json"))
    files.push(new File([bytecode], "bytecode.txt"))
    files.push(new File([standardJsonInput], "standardJsonInput.json"))

    const { IpfsHash } = await pinata.upload.fileArray(files, {
      cidVersion: 1,
      groupId: IPFS_W3GPT_GROUP_ID,
      metadata: {
        name: "contract",
      },
    })

    return IpfsHash
  } catch (error) {
    console.error("ipfsUploadDir failed", error)
    return null
  }
}

export async function ipfsUploadFile(fileName: string, fileContent: string): Promise<string | null> {
  try {
    const file = new File([fileContent], fileName)
    const { IpfsHash } = await pinata.upload.file(file, {
      cidVersion: 1,
      groupId: IPFS_W3GPT_GROUP_ID,
      metadata: {
        name: fileName,
      },
    })

    return IpfsHash
  } catch (error) {
    console.error("ipfsUploadFile failed", error)
    return null
  }
}
