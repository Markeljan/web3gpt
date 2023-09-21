import { NFTStorage, File } from 'nft.storage';

interface GenerationResponse {
    artifacts: Array<{
        base64: string;
        seed: number;
        finishReason: string;
    }>
}

const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY as string });

export async function POST(req: Request) {
    const { text } = await req.json();
    const engine_id = 'stable-diffusion-xl-1024-v1-0';
    console.log('text recieved:', text)

    const stabilityResponse = await fetch(`https://api.stability.ai/v1/generation/${engine_id}/text-to-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
            text_prompts: [
                {
                    text: text,
                },
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 1,
        }),
    });

    if (!stabilityResponse.ok) {
        console.error(`Error in stability.ai`);
        return new Response(stabilityResponse.statusText, { status: stabilityResponse.status });
    }

    const stabilityJSON = await stabilityResponse.json() as GenerationResponse;

    // save the first artifact
    const image = stabilityJSON.artifacts[0];

    // Convert base64 image to Blob
    const blob = await fetch(`data:image/png;base64,${image.base64}`).then(res => res.blob());

    // Create a new File object with the Blob
    const imageFile = new File([blob], `generated-image.png`, { type: 'image/png' });

    // Upload the image to NFTStorage
    const imageCid = await client.storeBlob(imageFile);
    // Construct the IPFS URL for the image
    const imageUrl = `https://ipfs.io/ipfs/${imageCid}`;

    // Create a JSON object with the constructed URL
    const metadata = {
        image: imageUrl
    };

    // Convert JSON object to Blob for uploading to NFTStorage
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json');

    // Upload the metadata to NFTStorage
    const metadataCid = await client.storeBlob(metadataFile);
    const metadataUrl = `https://ipfs.io/ipfs/${metadataCid}`;

    // Return the CID (IPFS address) of the uploaded metadata
    return new Response(JSON.stringify({ metadataUrl: metadataUrl, imageUrl: imageUrl }));
}
