const fetchAbi = async (contractAddress: `0x${string}`): Promise<any> => {
    const url = `https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === '1') {
            return JSON.parse(data.result);
        } else {
            throw new Error(`Error fetching ABI: ${data.result}`);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default fetchAbi;