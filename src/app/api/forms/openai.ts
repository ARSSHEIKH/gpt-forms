import OpenAI from "openai";
import { Stream } from "openai/streaming";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getOpenAIResponse(prompt: string, temperature: number = 1.1){
  try {
    const params: OpenAI.CompletionCreateParams = {
      model: 'gpt-3.5-turbo-instruct',
      prompt: prompt,

      // max_tokens: 250,
      // temperature: 0.7, 
      "temperature": temperature
      // stream: true,

    };
    const completion: OpenAI.Completion = await client.completions.create(params);

    // for await (const part of stream) {
    //   process.stdout.write(part.choices[0]?.text || '');
    // }

    completion.choices.forEach(choice => {
      console.log(choice.text);  // Output the generated text.
    })
    // console.log(completion.choices[0])
    return completion.choices[0].text;


  } catch (error) {
    console.error(error);
  }
}
export default getOpenAIResponse
