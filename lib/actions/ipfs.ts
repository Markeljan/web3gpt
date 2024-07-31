"use server"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import PinataSDK from "@pinata/sdk"

import { PINATA_JWT } from "@/lib/config-server"

import type { SolcOutput } from "solc"
import type { Abi } from "viem"

const pinata = new PinataSDK({ pinataJWTKey: PINATA_JWT })

export async function ipfsUpload(
  sources: SolcOutput["sources"],
  abi: Abi,
  bytecode: string,
  standardJsonInput: string
): Promise<string> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "web3gpt-"))

  for (const [fileName, { content }] of Object.entries(sources)) {
    const filePath = path.join(tempDir, fileName)
    fs.writeFileSync(filePath, content)
  }

  fs.writeFileSync(path.join(tempDir, "abi.json"), JSON.stringify(abi, null, 2))
  fs.writeFileSync(path.join(tempDir, "bytecode.txt"), bytecode)
  fs.writeFileSync(path.join(tempDir, "standardJsonInput.json"), standardJsonInput)

  const { IpfsHash } = await pinata.pinFromFS(tempDir, {
    pinataOptions: {
      cidVersion: 1
    }
  })

  fs.rmSync(tempDir, { recursive: true, force: true })

  return IpfsHash
}
