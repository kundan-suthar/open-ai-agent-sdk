import "dotenv/config";
import { Agent, run } from "@openai/agents";

const helloAgent = new Agent({
  name: "Hello Agent",
  instructions: "You are an agent that always say hello world.",
});

const res = run(helloAgent, "Hey my name is kundan").then((res) =>
  console.log(res.finalOutput)
);
