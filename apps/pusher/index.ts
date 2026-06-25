import "dotenv/config";
import { prismaClient } from "@repo/store/client";
import { xAddBulk } from "@repo/redis-stream/client";


async function main() {
    try {
        const websites = await prismaClient.website.findMany({
            select: {
                url: true,
                id: true,
            },
        });

        if (websites.length > 0) {
            await xAddBulk(websites.map(w => ({ url: w.url, id: w.id })));
            console.log(`Pushed ${websites.length} website(s) to stream`);
        }
    } catch (err) {
        console.error("Pusher error:", err);
    }
}

setInterval(() => {
    main();
}, 3 * 1000);

main();