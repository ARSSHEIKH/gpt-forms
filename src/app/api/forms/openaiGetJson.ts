import OpenAI from "openai";
import { OpenAIChatMessageType } from "../types";
import { ChatCompletionMessageToolCall } from "openai/resources";
import { tableRowDataType } from "@/app/types/types";

// Example dummy function hard coded to return the same weather
// In production, this could be your backend API or an external API
function getCurrentWeather(location: string, unit = "fahrenheit") {
  if (location.toLowerCase().includes("tokyo")) {
    return JSON.stringify({ location: "Tokyo", temperature: "10", unit: "celsius" });
  } else if (location.toLowerCase().includes("san francisco")) {
    return JSON.stringify({ location: "San Francisco", temperature: "72", unit: "fahrenheit" });
  } else if (location.toLowerCase().includes("paris")) {
    return JSON.stringify({ location: "Paris", temperature: "22", unit: "fahrenheit" });
  } else {
    return JSON.stringify({ location, temperature: "unknown" });
  }
}
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// const messages = [
//   { role: "user", content: "What's the weather like in San Francisco, Tokyo, and Paris?" },
//   {
//     role: "assistant",
//     content: "\n\nSan Francisco: The weather in San Francisco is typically cool and breezy, with temperatures ranging from 50-60°F (10-15°C) throughout the year. The city is known for its foggy mornings and cooler summers, with occasional rain and winds.\n\nTokyo: Tokyo has a humid subtropical climate with four distinct seasons. In the summer (June-August), temperatures can reach highs of 86°F (30°C) with high humidity and occasional typhoons. Winters (December-February) are chilly but not too cold, with average temperatures around 40°F (4°C). Spring and autumn are mild and pleasant with temperatures ranging from 60-70°F (15-21°C).\n\nParis: Paris has a mild and temperate climate, with warm summers and cool winters. July and August are the hottest months, with average temperatures of 75°F (24°C). Winters (December-February) can get quite cold, with temperatures averaging around 41°F (5°C). Rain is common throughout the year, with higher chances from October to January.",
//   }
// ];
// const tools = [
//   {
//     type: "function",
//     function: {
//       name: "get_current_weather",
//       description: "Get the current weather in a given location",
//       parameters: {
//         type: "object",
//         properties: {
//           location: {
//             type: "string",
//             description: "The city and state, e.g. San Francisco, CA",
//           },
//           unit: { type: "string", enum: ["celsius", "fahrenheit"] },
//         },
//         required: ["location"],
//       },
//     },
//   },
// ];
const getParameters = (requiredFields: []) => {

  let properties = {};


  for (let index = 0; index < requiredFields.length; index++) {
    const element = requiredFields[index];
    properties[element]= { type: "string", description: `Place here value ${element}` };
    
  };
  


  // for (const key in requiredFields) {
  //   if (Object.prototype.hasOwnProperty.call(requiredFields, key)) {
  //     const element = requiredFields[key];

  //     properties = {
  //       ...properties,
  //       [key]: {
  //         type: "string",
  //         description: element,
  //       }
  //     }
  //   }
  // }
  console.log(properties, "properties");
  return {
    type: "object",
    properties: properties,
    required: Object.keys(properties),
  }
}


export default async function openaiGetJson(messages: any[], requiredFields: {}): Promise<tableRowDataType[] | undefined> {
 
  try {
    const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "get_required_info",
            description: "Get the required information from the conversation",
            parameters: getParameters(requiredFields)
          },
        },
      ],
      tool_choice: "auto",
    });
    const responseMessage = response.choices[0]?.message;
    const toolCalls: tableRowDataType[]|undefined = responseMessage?.tool_calls;
    // console.log("toolCalls", toolCalls)
    return toolCalls
   

  } catch (error) {
    console.error('Error getting chat completion:', error);
  }
}
