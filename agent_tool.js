import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";


const getWeatherTool = tool({
  name: "get_weather",
  description: "return the current weather information based on given city",
  parameters: z.object({
    city: z.string().describe("name of the city"),
  }),
  execute: async function ({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%c%t`;
    const res = await axios.get(url, { responseType: "text" });
    return `the weather of ${city} is ${res.data}`;
  },
});
const agent = new Agent({
  name: "Weather Agent",
  instructions: `You are an expert weather agent that helps user to tell weather report`,
  tools: [getWeatherTool],
});

async function main(query) {
  const result = await run(agent, query);
  console.log(`Result: `, result.finalOutput);
}

main("what is the weather of banglore.");
