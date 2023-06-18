import { Message } from "@/types/types";

export async function POST(req: Request): Promise<Response> {
    const conversation: Message[] = (await req.json()) as Message[];
    const functions = [
        {
            "name": "deployContract",
            "description": "Deploy a smart contract. Must be Solidity version 0.8.20 or greater. Must be a single-line string with no newline characters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The name of the contract. Only letters, no spaces or special characters."
                    },
                    "chains": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "The blockchain networks to deploy the contract to. No special characters."
                    },
                    "sourceCode": {
                        "type": "string",
                        "description": "The source code of the contract. Must be Solidity version 0.8.20 or greater. Must be a single-line string with no newline characters."
                    },
                    "constructorArgs": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "The arguments for the contract's constructor. Can be of any type. This field is optional."
                    }
                },
                "required": ["name", "chains", "sourceCode"]
            }
        }
    ]

    // SHALE API for opensource models
    // const response = await fetch(
    //     "https://shale.live/v1/chat/completions",
    //     {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //             'Authorization': `Bearer ${process.env.SHALE_API_KEY}`
    //         },
    //         body: JSON.stringify({
    //         model: "vicuna-13b-v1.1",
    //         messages: conversation,
    //         max_tokens: 524, 
    //         stream:true
    //     }),
    // });    
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${process.env.OPEN_AI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-0613",
            messages: conversation,
            functions: functions,
            function_call: "auto",
            max_tokens: 524,
            stream: true
        }),
    });

    const { body } = response;

    return new Response(body);
    
}