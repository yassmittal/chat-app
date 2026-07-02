import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  createUIMessageStreamResponse,
  toUIMessageStream,
  isStepCount,
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
    stopWhen: isStepCount(5),
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
      }),
      convertFahrenheitToCelcius: tool({
        description: "Convert a temperature in fahrenheit to celsius",
        inputSchema: z.object({
          temperature: z
            .number()
            .describe("The temperature in fahrenheit to convert"),
        }),
        execute: async({temperature}) => {
          const celsius = Math.round((temperature - 32) * ( 5 / 9));
          return {
            celsius,
          }
        }
      })
    }
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}