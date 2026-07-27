import jwt from "jsonwebtoken";
import cors from "cors";
import bcrypt from "bcryptjs";
import express from "express";
import {prismaClient} from "db/client";
import { AuthInput } from "./types";
import { authMiddleware } from "./middleware";
const app=express();
app.use(cors({ origin: true }));
app.use(express.json());

// Ingress serves API under /api; strip so existing routes keep working
app.use((req, _res, next) => {
    if (req.url === "/api" || req.url.startsWith("/api/")) {
        req.url = req.url.slice(4) || "/";
    }
    next();
});

app.post("/website", authMiddleware, async (req, res) => {
    if (!req.body.url) {
        res.status(411).json({ message: "URL is required in the request body." });
        return;
    }
    const website = await prismaClient.website.create({
        data: {
            url: req.body.url,
            time_added: new Date(),
            user_id: req.userId!
        }
    })

    res.json({
        id: website.id
    })
});

app.delete("/website/:websiteId", authMiddleware, async (req, res) => {
    const websiteId = req.params.websiteId as string;

    const website = await prismaClient.website.findFirst({
        where: {
            id: websiteId,
            user_id: req.userId!,
        },
    });

    if (!website) {
        res.status(404).json({ message: "Website not found" });
        return;
    }

    await prismaClient.$transaction([
        prismaClient.website_tick.deleteMany({ where: { website_id: websiteId } }),
        prismaClient.website.delete({ where: { id: websiteId } }),
    ]);

    res.json({ id: websiteId });
});

app.get("/regions", authMiddleware, async (_req, res) => {
    const regions = await prismaClient.region.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });
    res.json({ regions });
});

app.get("/websites", authMiddleware, async (req, res) => {
    const websites = await prismaClient.website.findMany({
        where: {
            user_id: req.userId!,
        },
        include: {
            ticks: {
                orderBy: [{
                    createdAt: "desc",
                }],
                take: 20,
                include: {
                    region: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            time_added: "desc",
        },
    });

    res.json({
        websites,
    });
});

const STATUS_RANGES = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
} as const;

type StatusRange = keyof typeof STATUS_RANGES;
const TIMELINE_LIMIT = 48;

app.get("/status/:websiteId", authMiddleware, async (req, res) => {
    const websiteId = req.params.websiteId as string;
    const rangeParam = typeof req.query.range === "string" ? req.query.range : "24h";
    const range: StatusRange = rangeParam in STATUS_RANGES
        ? (rangeParam as StatusRange)
        : "24h";
    const regionName =
        typeof req.query.region === "string" && req.query.region !== "all"
            ? req.query.region
            : undefined;

    const website = await prismaClient.website.findFirst({
        where: {
            user_id: req.userId!,
            id: websiteId,
        },
    });

    if (!website) {
        res.status(409).json({
            message: "Website not found",
        });
        return;
    }

    const since = new Date(Date.now() - STATUS_RANGES[range]);
    const tickWhere = {
        website_id: websiteId,
        createdAt: { gte: since },
        ...(regionName
            ? { region: { name: regionName } }
            : {}),
    };

    const [ticks, aggregate, upCount, downCount, unknownCount] = await Promise.all([
        prismaClient.website_tick.findMany({
            where: tickWhere,
            orderBy: { createdAt: "desc" },
            take: TIMELINE_LIMIT,
            include: {
                region: {
                    select: { id: true, name: true },
                },
            },
        }),
        prismaClient.website_tick.aggregate({
            where: tickWhere,
            _count: { _all: true },
            _avg: { response_time_ms: true },
        }),
        prismaClient.website_tick.count({
            where: { ...tickWhere, status: "Up" },
        }),
        prismaClient.website_tick.count({
            where: { ...tickWhere, status: "Down" },
        }),
        prismaClient.website_tick.count({
            where: { ...tickWhere, status: "Unknown" },
        }),
    ]);

    const totalChecks = aggregate._count._all;
    const uptimePercentage =
        totalChecks > 0
            ? Number(((upCount / totalChecks) * 100).toFixed(2))
            : 0;

    res.json({
        url: website.url,
        id: website.id,
        user_id: website.user_id,
        time_added: website.time_added,
        range,
        since,
        ticks,
        stats: {
            totalChecks,
            upCount,
            downCount,
            unknownCount,
            avgResponseTimeMs: Math.round(aggregate._avg.response_time_ms ?? 0),
            uptimePercentage,
            timelineCount: ticks.length,
            truncated: totalChecks > ticks.length,
        },
    });
});


app.post("/user/signup",async (req,res)=>{
    const data =AuthInput.safeParse(req.body);
    if(!data.success){
        res.status(403).json({ message: "Invalid username or password" });
        return;
    }

    const existing = await prismaClient.user.findFirst({
        where: { username: data.data.username },
    });
    if (existing) {
        res.status(409).json({ message: "Account already exists" });
        return;
    }

    try{
        const hashedPassword = await bcrypt.hash(data.data.password, 10);
        let user=await prismaClient.user.create({
            data:{
                username: data.data.username,
                password: hashedPassword,
            }
        })
        res.status(201).json({
            id: user.id
        });
    } catch(error){
        res.status(403).json({ message: "Signup failed" });
        return;
    }
});

app.post("/user/signin",async (req,res)=>{
    const data =AuthInput.safeParse(req.body);
    if(!data.success){
        res.status(403).json({ message: "Invalid username or password" });
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: { username: data.data.username },
    });

    if (!user) {
        res.status(403).json({ message: "Invalid username or password" });
        return;
    }

    const isHashed = user.password.startsWith("$2");
    let valid = false;

    if (isHashed) {
        valid = await bcrypt.compare(data.data.password, user.password);
    } else {
        // Migrate legacy plaintext passwords
        valid = user.password === data.data.password;
        if (valid) {
            const hashedPassword = await bcrypt.hash(data.data.password, 10);
            await prismaClient.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
        }
    }

    if (!valid) {
        res.status(403).json({ message: "Invalid username or password" });
        return;
    }

    const token = jwt.sign({
        sub: user.id,
    }, process.env.JWT_SECRET!);

    res.json({
        jwt: token,
    });
})
 
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  });