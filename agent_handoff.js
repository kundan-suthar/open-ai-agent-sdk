import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

import fs from "node:fs/promises";

const processRefund = tool({
  name: "process_refund",
  description: `this tool processes the refund for a customer`,
  parameters: z.object({
    customerId: z.string().describe("id of the customer"),
    reason: z.string().describe("reaons for refund"),
  }),
  execute: async function ({ customerId, reason }) {
    await fs.appendFile(
      "./refunds.txt",
      `refund for customer having id ${customerId} for ${reason} \n`,
      "utf-8"
    );
    return { refundIssued: true };
  },
});

const refundAgent = new Agent({
  name: "refund agent",
  instructions: `You are expert in issuing refunt to the customer `,
  tools: [processRefund],
});

const fetchAvailablePlan = tool({
  name: "available plan",
  description: "fetches the available plan for internet",
  parameters: z.object({}),
  execute: async function () {
    return [
      {
        plan_id: "1",
        price_inr: 399,
        speed: "30MB/s",
      },
      {
        plan_id: "2",
        price_inr: 499,
        speed: "50MB/s",
      },
      {
        plan_id: "1",
        price_inr: 599,
        speed: "70MB/s",
      },
    ];
  },
});

const salesAgent = new Agent({
  name: "Sales Agent",
  instructions: ` you are an expert sales agent for an internet broadband company. Talk to user and help them with what they need`,
  tools: [
    fetchAvailablePlan,
    refundAgent.asTool({
      name: "refund_expert",
      toolDescription: "handles refund question and requests.",
    }),
  ],
  model: "gpt-4.1-mini",
});

const receptionAgent = new Agent({
  name: "reception Agent",
  instructions: `${RECOMMENDED_PROMPT_PREFIX} you are the customer facing agent expert in understanding what customer needs and then route them or handoff them to the right person.`,
  handoffDescription: `you have two agents available
  -salesAgent: Expert in handling queries like all plans and pricing avilable.
  good for new customer. 
  - refundAgent: Expert in handling user queries for existing customers and issue refunds and help them.`,
  handoffs: [salesAgent, refundAgent],
});

async function main(query) {
  const result = await run(receptionAgent, query);
  console.log(`result`, result.finalOutput);
  console.log(`history`, result.history);
}

main(
  `Hey there can I get refund as I am not happy with internet speed provided by your copany my cust id is 123?`
);
