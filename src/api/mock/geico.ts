import { randomUUID } from "crypto";

interface RequestBody {
    [key: string]: any;
}

interface QuoteResponse {
    carrier: string;
    premium: number;
    quoteId: string;
    received: RequestBody;
}

export default async function handler(req: any, res: any): Promise<void> {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const body: RequestBody = req.body;

    res.status(200).json({
        carrier: "Geico",
        premium: Number((Math.random() * 70 + 110).toFixed(2)),
        quoteId: randomUUID(),
        received: body
    });
}
