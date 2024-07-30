
type CreatedAtType = {
    seconds: number;
    nanoseconds: number;
}

export type GptChatDataType = {
    id: string;
    question: {
        text: string;
        createdAt: CreatedAtType
    };
    answer?: {
        text: string;
        createdAt: CreatedAtType
    };
}


export type tableRowQuestionDataType = {
    question: string,
    answer: string,
    id: string,
}

export type tableRowDataType = {
    id: string;
    
    function: {
        arguments: {

        } | string;
        name: string;
    };
}
