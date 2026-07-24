import axios from "axios";
import { xAckBulk, xReadGroup } from "redisstream/client";
import { prismaClient } from "db/client";

const REGION_NAME = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if (!REGION_NAME) {
    throw new Error("Region not provided");
}

if (!WORKER_ID) {
    throw new Error("Worker not provided");
}

async function main() {
    const region = await prismaClient.region.findFirst({
        where: { name: REGION_NAME },
    });

    if (!region) {
        throw new Error(`Region not found: ${REGION_NAME}`);
    }

    const regionId = region.id;

    while (1) {
        const response = await xReadGroup(REGION_NAME, WORKER_ID);

        if (!response) {
            console.log(`[${WORKER_ID}] waiting for websites...`);
            await new Promise((r) => setTimeout(r, 2000));
            continue;
        }

        console.log(
            `[${WORKER_ID}] checking ${response.length} website(s):`,
            response.map(({ message }) => message.url)
        );

        let promises = response.map(({ message }) =>
            fetchWebsite(message.url, message.id, regionId)
        );
        await Promise.all(promises);

        xAckBulk(REGION_NAME, response.map(({ id }) => id));
        console.log(`[${WORKER_ID}] done, acked ${response.length}`);
    }
}

async function fetchWebsite(url: string, websiteId: string, regionId: string) {
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now();

        axios.get(url)
            .then(async () => {
                const endTime = Date.now();
                await prismaClient.website_tick.create({
                    data: {
                        response_time_ms: endTime - startTime,
                        status: "Up",
                        region_id: regionId,
                        website_id: websiteId
                    }
                })
                resolve()
            })
            .catch(async () => {
                const endTime = Date.now();
                await prismaClient.website_tick.create({
                    data: {
                        response_time_ms: endTime - startTime,
                        status: "Down",
                        region_id: regionId,
                        website_id: websiteId
                    }
                })
                resolve()
            })
    })
}

main();
