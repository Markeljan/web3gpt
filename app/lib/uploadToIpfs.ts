import { NFTStorage, File } from 'nft.storage';

const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_API_KEY || '';
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

export interface UploadResult {
  cid: string | null;
  error: Error | null;
}
const uploadToIpfs = async (sources: { [fileName: string]: { content: any; }; }, abi: any, bytecode: string, standardJsonInput: string): Promise<UploadResult> => {

  const files = [];

  for (const key in sources) {
    const contractCode = new File([sources[key].content], `${key}`, { type: 'text/x-solidity' });
    files.push(contractCode);
  }

  const abiFile = new File([abi], `abi.json`, { type: 'application/json' });
  const bytecodeFile = new File([bytecode], `bytecode.txt`, { type: 'text/plain' });
  const standardJsonInputFile = new File([standardJsonInput], `standardJsonInput.json`, { type: 'application/json' });

  files.push(abiFile, bytecodeFile, standardJsonInputFile);

  const cid = await client.storeDirectory(files);

  return { cid, error: null };
};

export default uploadToIpfs;