import express from "express";
import { shopifyApp } from "@shopify/shopify-app-express";

import webhookHandlers from "./webhook-handler.js";
import serveStatic from "serve-static";
import { readFileSync } from "fs";



import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();
const storage = new PrismaSessionStorage(prisma);

const shopify = shopifyApp({
  api: {
    apiKey: "5c15fcf782fe1c7a83065eaabf7dbfc0",
    apiSecretKey: "f51e745d8bb4a6934849693001cfff1f",
    scopes: ["write_content,read_content"],
    hostScheme: "https",
    hostName: "9a31c5c8e1af.ngrok.app",
  },
  sessionStorage: storage,
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
});

const app = express();

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers })
);


// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js
const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;


    
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use(express.static(('/home/cartrabbit/Projects/express/frontend/dist'), {
  index: false,
}));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync("/home/cartrabbit/Projects/express/frontend/dist/index.html"));
});

app.listen(3000, () => console.log("Server started"));
