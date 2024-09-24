"use server"

import { type FileObject, PinataSDK } from "pinata"
import type { SolcOutput } from "solc"
import type { Abi } from "viem"

import { IPFS_GATEWAY } from "@/lib/config"
import { PINATA_JWT } from "@/lib/data"

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: IPFS_GATEWAY
})

export async function ipfsUploadDir(
  sources: SolcOutput["sources"],
  abi: Abi,
  bytecode: string,
  standardJsonInput: string
): Promise<string | null> {
  try {
    const files: FileObject[] = []

    for (const [fileName, { content }] of Object.entries(sources)) {
      files.push(new File([content], fileName))
    }
    files.push(new File([JSON.stringify(abi, null, 2)], "abi.json"))
    files.push(new File([bytecode], "bytecode.txt"))
    files.push(new File([standardJsonInput], "standardJsonInput.json"))

    const { IpfsHash } = await pinata.upload.fileArray(files, {
      cidVersion: 1,
      metadata: {
        name: "contract"
      }
    })

    return IpfsHash
  } catch (error) {
    console.error("Error writing to temporary file:", error)
    return null
  }
}

export async function ipfsUploadFile(fileName: string, fileContent: string | Buffer): Promise<string | null> {
  try {
    const file = new File([fileContent], fileName)
    const { IpfsHash } = await pinata.upload.file(file, {
      cidVersion: 1,
      metadata: {
        name: fileName
      }
    })

    return IpfsHash
  } catch (error) {
    console.error("Error writing to temporary file:", error)
    return null
  }
}
