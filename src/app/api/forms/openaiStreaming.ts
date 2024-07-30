import OpenAI from "openai";
import { Stream } from "openai/streaming";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getOpenAIStreamResponse(prompt: string) {
  try {
    const params: OpenAI.ChatCompletionCreateParamsStreaming = {
      model: 'gpt-3.5-turbo',
      messages:[{"role": "assistant", "content": prompt}],
      // "max_tokens": 250,
      // "temperature": 0.7
      stream: true,
      
    };
    const stream: Stream<OpenAI.ChatCompletionChunk> = await client.chat.completions.create(params);

    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
    // completion.choices.forEach(choice => {
    //   console.log(choice.text);  // Output the generated text.
    // })
    // console.log(completion.choices[0])
    // return completion.choices[0].text;


  } catch (error) {
    console.error(error);
  }
}
export default getOpenAIStreamResponse
