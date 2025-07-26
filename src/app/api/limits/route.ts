import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8080";

export async function GET(request: NextRequest) : Promise<NextResponse> {
    try {
        const response = await fetch(`${BACKEND_URL}/limits`, {
            method: 'GET',
        })

        if (!response.ok) {
            return NextResponse.json(
                {error: 'Backend request failed'},
                {status: response.status}
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch(error) {
        console.log(error);
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}