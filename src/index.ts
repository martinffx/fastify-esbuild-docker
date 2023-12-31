import { Server, IncomingMessage, ServerResponse } from "http";
import fastify, { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import * as pug from "pug";
import path from "path";
import fastifyUnderPressure from "@fastify/under-pressure";

const buildServer = (): FastifyInstance => {
  const server = fastify<Server, IncomingMessage, ServerResponse>({
    logger: {
      transport: {
        targets: [
          {
            target: "pino-pretty",
            level: "debug",
            options: {
              colorize: true,
            },
          },
        ],
      },
    },
  });

  server.register(fastifyUnderPressure, {
    maxEventLoopDelay: 10000,
    maxHeapUsedBytes: 1000000000,
    maxRssBytes: 1000000000,
    maxEventLoopUtilization: 0.98,
  });

  server.register(fastifyStatic, {
    root: path.join(__dirname, "static"),
    prefix: "/static/",
  });

  server.register(fastifyView, {
    engine: {
      pug: pug,
    },
    root: path.join(__dirname, "./templates"),
    defaultContext: {
      companyName: "likedsongs.xyz",
      navItems: [
        { name: "Songs", path: "/songs" },
        { name: "Playlists", path: "/playlists" },
      ],
      isPageInNavPath: (navPath: string, currentPath: string): boolean => {
        return currentPath.startsWith(navPath);
      },
    },
  });

  server.get("/health", (_req, reply) => {
    reply.send({}).code(200);
  });

  server.get("/", async (_req, reply) => {
    return reply.view("home.pug");
  });

  return server;
};

const start = async () => {
  const server = buildServer();
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
