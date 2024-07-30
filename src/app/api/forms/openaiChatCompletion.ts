import OpenAI from "openai";
import { OpenAIChatMessageType } from "../types";

console.log("process.env.OPENAI_API_KEY", process.env.OPENAI_API_KEY)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
async function getOpenAIChatResponse(messages: OpenAIChatMessageType[]): Promise<OpenAIChatMessageType>{
  try {
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.1, // Reduced temperature for more deterministic responses
      top_p: 1,
      n: 1,
      stream: false,
      max_tokens: 250,
      presence_penalty: 0.6, // Increased presence penalty
      frequency_penalty: 0.6, // Increased frequency penalty
    };
    const completion: OpenAI.Chat.ChatCompletion = await client.chat.completions.create(params);

    // for await (const part of stream) {
    //   process.stdout.write(part.choices[0]?.text || '');
    // }
    // completion.choices.forEach(choice => {
    //   console.log(choice.message.content);  // Output the generated text.
    // })
    // console.log(completion.choices[0])
    return completion.choices[0].message;


  } catch (error: any) {
    console.error(error);
    return error
  }
}
export default getOpenAIChatResponse
