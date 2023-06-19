import { NextResponse } from "next/server";
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageFunctionCall } from "openai";

export async function POST(req: Request): Promise<NextResponse> {
    const { baseURL, model, messages, functions }: {baseURL: string, model: string, messages: ChatCompletionRequestMessage[], functions: ChatCompletionRequestMessageFunctionCall} = await req.json();

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
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: model || "gpt-3.5-turbo-0613",
            messages: messages,
            functions: functions,
            function_call: "auto",
            max_tokens: 1024,
            stream: true
        }),
    });

    return new NextResponse(response.body);
}