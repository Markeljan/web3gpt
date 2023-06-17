import { Message } from "@/types/types";

export async function POST(req: Request): Promise<Response> {
    const conversation: Message[] = (await req.json()) as Message[];

    // SHALE API for opensource models
    // const response = await fetch(
    //     "https://shale.live/v1/chat/completions",
    //     {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SHALE_API_KEY}`
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
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPEN_AI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-0613",
            messages: conversation,
            max_tokens: 524,
            stream: true
        }),
    });

    const { body } = response;

    return new Response(body);
    
}