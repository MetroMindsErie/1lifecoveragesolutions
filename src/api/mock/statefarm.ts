import { randomUUID } from "crypto";

interface QuoteRequest {
    [key: string]: any;
}

interface QuoteResponse {
    carrier: string;
    premium: number;
    quoteId: string;
    received: QuoteRequest;
}

interface ErrorResponse {
    error: string;
}

export default async function handler(
    req: { method: string; body: QuoteRequest },
    res: {
        status: (code: number) => {
            json: (data: QuoteResponse | ErrorResponse) => void;
        };
    }
): Promise<void> {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body;

    res.status(200).json({
        carrier: "StateFarm",
        premium: Number((Math.random() * 90 + 130).toFixed(2)),
        quoteId: randomUUID(),
        received: body
    });
}
