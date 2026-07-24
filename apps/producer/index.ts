import { prismaClient } from "db/client";
import { xAddBulk } from "redisstream/client";

async function main() {
    let websites = await prismaClient.website.findMany({
        select: {
            url: true,
            id: true
        }
    })
  
    await xAddBulk(websites.map(w => ({
        url: w.url,
        id: w.id
    })));
    console.log("Added websites to queue");
    console.log(websites.map(w => w.url));
}

setInterval(() => {
    main()
}, 1* 60 * 1000 )

main()