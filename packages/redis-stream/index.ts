import { createClient } from "redis";

type RedisClient = Awaited<ReturnType<ReturnType<typeof createClient>["connect"]>>;

type WebsiteEvent = { url: string; id: string };
type MessageType = {
    id: string;
    message: {
        url: string;
        id: string;
    };
};

const STREAM_NAME = "betteruptime:website";

let _client: RedisClient | null = null;

async function getClient(): Promise<RedisClient> {
    if (!_client) {
        _client = await createClient({
            url: process.env.REDIS_URL ?? "redis://localhost:6379",
        })
            .on("error", (err) => console.log("Redis Client Error", err))
            .connect();
    }
    return _client;
}

async function xAdd({ url, id }: WebsiteEvent) {
    const client = await getClient();
    await client.xAdd(STREAM_NAME, "*", { url, id });
}

export async function xAddBulk(websites: WebsiteEvent[]) {
    for (let i = 0; i < websites.length; i++) {
        await xAdd({ url: websites[i].url, id: websites[i].id });
    }
}

export async function xReadGroup(
    consumerGroup: string,
    workerId: string
): Promise<MessageType[] | undefined> {
    const client = await getClient();

    // Create consumer group if it doesn't exist yet
    try {
        await client.xGroupCreate(STREAM_NAME, consumerGroup, "0", {
            MKSTREAM: true,
        });
    } catch (_) {
        // Group already exists — that's fine
    }

    const res = await client.xReadGroup(
        consumerGroup,
        workerId,
        { key: STREAM_NAME, id: ">" },
        { COUNT: 20, BLOCK: 2000 }
    );

    const messages = res?.[0]?.messages as MessageType[] | undefined;
    return messages;
}

async function xAck(consumerGroup: string, eventId: string) {
    const client = await getClient();
    await client.xAck(STREAM_NAME, consumerGroup, eventId);
}

export async function xAckBulk(consumerGroup: string, eventIds: string[]) {
    await Promise.all(eventIds.map((id) => xAck(consumerGroup, id)));
}
