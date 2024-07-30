import { ChatCompletionAssistantMessageParam, ChatCompletionContentPart, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from "openai/resources";

export type OpenAIChatMessageType = ChatCompletionSystemMessageParam | ChatCompletionAssistantMessageParam | ChatCompletionUserMessageParam;

type CreatedAtType = {

    seconds: number;
    nanoseconds: number;

} | Date

export type GptChatDataType = {
    id: string;
    question: {
        text: string | ChatCompletionContentPart[];
        createdAt: CreatedAtType
    };
    answer?: {
        text: string;
        createdAt: CreatedAtType
    };
}