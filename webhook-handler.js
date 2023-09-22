import { DeliveryMethod } from "@shopify/shopify-api";

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  SHOP_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/webhook/shop_update",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log(payload);
    },
  },
};