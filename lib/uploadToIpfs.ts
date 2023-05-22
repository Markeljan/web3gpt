import { NFTStorage, File } from 'nft.storage';

const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_API_KEY || '';
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

export interface UploadResult {
  cid: string | null;
  error: Error | null;
}
const uploadToIpfs = async ( sources: { [fileName: string]: { content: any; }; }, abi: any, bytecode: string): Promise<UploadResult> => {

  //for each file in the sources object, create a file object
  const contracts = Object.keys(sources).map((key) => {
    const contractCode = new File([sources[key].content], `${key}`, { type: 'text/x-solidity' });
    return contractCode;
  });
  const abiFile = new File([JSON.stringify(abi)], `abi.json`, { type: 'application/json' });
  const bytecodeFile = new File([bytecode], `bytecode.txt`, { type: 'text/plain' });

  const cid = await client.storeDirectory([
    ...contracts,
    abiFile,
    bytecodeFile,
  ]);

  return { cid, error: null };
};

export default uploadToIpfs;