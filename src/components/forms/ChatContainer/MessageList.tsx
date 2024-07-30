// MessageList.tsx
import React, { useRef, useEffect } from 'react';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import mbStyle from "./messagebox.module.css"

interface Message {
    id?: string | number;
    title: string;
    position: 'left' | 'right';
    type: any;
    text: string;
    date: Date;
}

interface MessageListProps {
    messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {

    return (
            messages.map((msg, index) => (
                <MessageBox
                    key={index}
                    title={msg.title ?? "User"}
                    position={msg.position}
                    type={msg.type}
                    text={msg.text}
                    date={msg.date}
                    className={mbStyle.mbox_container}
                />
            ))
    );
};

export default MessageList;
