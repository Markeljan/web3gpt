import { NextResponse } from "next/server";

const createResponse = (status: number, data?: any, headers?: HeadersInit) => {
  const payload = data ? { data } : {};

  const defaultHeaders = {
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
