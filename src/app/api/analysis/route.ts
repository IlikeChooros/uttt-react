import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request: NextRequest) : Promise<NextResponse> {
    try {
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
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