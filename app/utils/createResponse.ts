import { NextResponse } from "next/server";

const createResponse = (status: number, data?: any, headers?: HeadersInit) => {
  const payload = data ? { data } : {};

  const defaultHeaders = {
    "Access-Control-Allow-Origin": "https://chat.openai.com",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, openai-ephemeral-user-id, openai-conversation-id",
  };

  return NextResponse.json(payload, {
    status,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });
};

export default createResponse;
