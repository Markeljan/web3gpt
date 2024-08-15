import axios from 'axios';
import fs from 'fs';

const ipfsStoreFilePin = async (content: string) => {
  const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || "";
  const secretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || "";
  const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  try {
    const tsBlob = new Blob([content], {
      type: "text/plain"
    })
    const tsFie = new File([tsBlob], "tokenscript.tsml");
  
    // Upload the metadata to NFTStorage
    //const metadataCid = await client.storeBlob(metadataFile)
    //const metadataUrl = `ipfs://${metadataCid}`


    //const data = new FormData();
    //const buffer = Buffer.from(content, 'utf-8');
    //const blob = stringToBlob(content);

    //TypeError: Failed to execute 'append' on 'FormData': parameter 2 is not of type 'Blob'.
  
    /*data.append('file', blob, {
      filename: 'content.txt',
      contentType: 'text/plain',
      knownLength: buffer.length
    });*/

    let data = new FormData();
    data.append('file', tsFie);
  
    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': `multipart/form-data`,
          Authorization: `Bearer ${pinataJWT}`,
        },
      });

      console.log(`JSON response: ${JSON.stringify(response.data)}`);
    
      return response.data.IpfsHash;
  } catch (error) {
    console.error('Error writing to temporary file:', error);
    return null;
  }
} catch (error) {
  console.error('Error uploading file to IPFS:', error);  
  return null;
}
}
  

export default ipfsStoreFilePin;
