// MessageInput.tsx
import React, { FormEventHandler, useState } from 'react';
import { Input } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import { Button } from '@mui/material';

interface MessageInputProps {
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    
}

const MessageInput: React.FC<MessageInputProps> = ({ text, setText, handleSend }) => {



    return (
        <Input
            placeholder="Type your answer..."
            multiline={false}
            maxHeight={300}
            value={text ?? ""}
            onChange={(e: any) => setText(e.target.value)}
            rightButtons={
                <Button
                    type="submit"
                    variant='contained'
                    color="primary"
                    size='small'
                    onClick={handleSend}
                >
                    Send
                </Button>
            }
        />
    );
};

export default MessageInput;
