import { randomUUID } from "crypto";

interface QuoteRequestBody {
    [key: string]: any;
}

interface QuoteResponse {
    carrier: string;
    premium: number;
    quoteId: string;
    received: QuoteRequestBody;
}

interface RequestHandler {
    method?: string;
    body: QuoteRequestBody;
}

interface ResponseHandler {
    status: (code: number) => ResponseHandler;
    json: (data: { error?: string } | QuoteResponse) => void;
}

export default async function handler(req: RequestHandler, res: ResponseHandler) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body;

    res.status(200).json({
        carrier: "Progressive",
        premium: Number((Math.random() * 80 + 120).toFixed(2)),
        quoteId: randomUUID(),
        received: body
    });
}
