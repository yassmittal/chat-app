import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from 'ai';
import { createAmazonBedrock  } from "@ai-sdk/amazon-bedrock";
import z from 'zod';

const bedrockMantle = createAmazonBedrock({
  region: 'us-east-1'
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: bedrockMantle("qwen.qwen3-coder-next"),
    messages: await convertToModelMessages(messages),
    tools: {
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        inputSchema: z.object({
          location: z.string().describe("The location to get the weather for"),
        }),
        execute: async({location}) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature
          };
        },
      })
    }
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}