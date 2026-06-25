import "dotenv/config";
import axios from "axios";
import { xAckBulk, xReadGroup } from "@repo/redis-stream/client";
import { prismaClient } from "@repo/store/client";

const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if (!REGION_ID) {
    throw new Error("REGION_ID env variable not provided");
}

if (!WORKER_ID) {
    throw new Error("WORKER_ID env variable not provided");
}

async function main() {
    // Ensure this worker's region exists in the DB before processing
    await prismaClient.region.upsert({
        where: { id: REGION_ID },
        create: { id: REGION_ID, name: REGION_ID },
        update: {},
    });

    console.log(`Worker started — region: ${REGION_ID}, id: ${WORKER_ID}`);

    while (true) {
        const response = await xReadGroup(REGION_ID, WORKER_ID);

        if (!response || response.length === 0) {
            continue;
        }

        await Promise.all(
            response.map(({ message }) => fetchWebsite(message.url, message.id))
        );
        console.log(`Processed ${response.length} website(s)`);

        await xAckBulk(REGION_ID, response.map(({ id }) => id));
    }
}

async function fetchWebsite(url: string, websiteId: string) {
    const startTime = Date.now();
    let status: "Up" | "Down" = "Up";

    try {
        await axios.get(url, { timeout: 10000, validateStatus: () => true });
    } catch {
        status = "Down";
    }

    const responseTime = Date.now() - startTime;

    try {
        await prismaClient.websiteTick.create({
            data: {
                response_time: responseTime,
                status,
                region_id: REGION_ID,
                website_id: websiteId,
            },
        });
    } catch (err) {
        console.error(`Failed to save tick for ${url}:`, err);
    }
}

main().catch((err) => {
    console.error("Worker crashed:", err);
    process.exit(1);
});
