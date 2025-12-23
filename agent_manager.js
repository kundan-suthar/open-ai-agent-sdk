import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

import fs from "node:fs/promises";

const fetchAvailableTool = tool({
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
      `refund for customer having id ${customerId} for ${reason}`,
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
const salesAgent = new Agent({
  name: "Sales Agent",
  instructions: ` you are an expert sales agent for an internet broadband company. Talk to user and help them with what they need`,
  tools: [
    fetchAvailableTool,
    refundAgent.asTool({
      name: "refund_expert",
      toolDescription: "handles refund question and requests.",
    }),
  ],
  model: "gpt-4.1-mini",
});

async function runAgents(query = "") {
  const result = await run(salesAgent, query);
  console.log(result.finalOutput);
}

runAgents(`Hey I had a plan of 399. I want a refund. my cust id is cust123. Your internet speed is not as promised. 
    please deactivate and issue refund. I had taken plan 1 week back. 
    my anme and contact information same as account name. 
    no feedback just do refund`);
