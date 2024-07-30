import { sendChat } from '@/services/chat';
import { GptChatDataType } from '@/types/types';
import { Button } from '@mui/material';
import cookie from 'js-cookie';
import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/config/firebaseClient';
import {
    MessageBox,
    Input,
} from 'react-chat-elements';
import 'react-chat-elements/dist/main.css'; // Import the CSS file
import Cookies from 'js-cookie';
import { useParams } from 'next/navigation';
import { convertTimeStampToDate } from '@/utils/dateTimeFormats';
import updateForm from '@/services/updateForm';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { sendUserChat } from '@/services/sendUserChat';

interface Message {
    id?: string | number;
    title: string;
    position: 'left' | 'right';
    type: any
    text: string;
    date: Date;
}

const ChatBox = ({ formSubmited, setFormSubmited, setGeneratedLink }:
    {
        formSubmited: boolean,
        setFormSubmited: React.Dispatch<React.SetStateAction<boolean>>,

    }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState<string>('');
    // const [questions, setQuestions] = useState<GptChatDataType[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const token = cookie.get("token");
    const [data, setData] = useState<GptChatDataType[]>([])
    const promptId = Cookies.get("promptId");
    const { id } = useParams<any>()
    const [view, setView] = useState(id ? true : false);

    const messageBoxRef = useRef<HTMLDivElement | null>(null)
    const [chatEnded, setChatEnded] = useState<boolean>(false);


    useEffect(() => {

        setChatEnded(false);
    }, [])

    // For getting chats on realtime
    useEffect(() => {
        const docRef = collection(db, "conversations")
        const q = query(docRef);

        const unSubscribed = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.doc.id == promptId) {
                    const allDoc = change.doc.data()?.data;
                    const currentDoc = allDoc?.find(doc => doc.uid == token);
                    console.log("currentDoc", currentDoc)
                    const questions = currentDoc.questions;
                    const isUpdated = currentDoc.updated;
                    if (questions?.length > data.length || isUpdated) {


                        let filtered = [];
                        let filteredMsg = []
                        // setData(questions)

                        let currentIndex = messages.length == 1 ? 0 : currentQuestionIndex;
                        for (let i = 0; i < questions.length; i++) {
                            const element1 = questions[i];
                            if (messages?.length > 0)
                                for (let j = 0; j < messages.length; j++) {
                                    const element2 = messages[j];
                                    console.log("element1", element1)
                                    console.log("element2", element2)
                                    if (element1?.id != element2?.id) {
                                        filtered.push(element1);
                                    }
                                    // setMessages(filtered)
                                    filteredMsg = filtered

                                    setData(filtered)
                                }
                            else
                                // setMessages(questions)
                                filteredMsg = questions
                            setData(questions)
                        }
                    }
                }
            });
        })
        //   unSubscribed();
        return () => unSubscribed();
    }, [promptId]);

    // For getting chats from data after when page loaded
    useEffect(() => {
        if (data.length > 0 && !view) {
            // setQuestions(data);
            let currentIndex = messages.length == 1 ? 0 : currentQuestionIndex;

            if (currentIndex < data.length) {


                const title = data[currentIndex]?.question?.text?.split(": ")[0];
                const text = data[currentIndex]?.question?.text?.split(": ")[1]
                const date = convertTimeStampToDate(data[currentIndex].question.createdAt);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        title: title,
                        id: data[currentIndex]?.id,
                        text: text,
                        position: 'left',
                        type: 'text',
                        date: date,
                    },
                ]);
                currentIndex = currentIndex + 1
                setCurrentQuestionIndex(currentIndex);

            }
        }
    }, [data]);


    // For getting chats from data
    useEffect(() => {
        if (id && data.length > 0 && view) {
            // setQuestions(data);
            let currentIndex = 0;

            do {

                const element = data[currentIndex];
                const title = element?.question?.text?.split(": ")[0];
                const text = element?.question?.text?.split(": ")[1]
                const date = convertTimeStampToDate(element?.question?.createdAt);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        title: title,
                        id: element?.id,
                        text: text,
                        position: 'left',
                        type: 'text',
                        date: date,
                    },
                ]);
                if (element?.answer?.text) {
                    const title = element?.answer?.text?.split(": ")[0];
                    const text = element?.answer?.text?.split(": ")[1]
                    const date = convertTimeStampToDate(element.answer.createdAt);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            title: title,
                            id: element?.id,
                            text: text,
                            position: 'right',
                            type: 'text',
                            date: date,
                        },
                    ]);
                }
                currentIndex = currentIndex + 1
                setCurrentQuestionIndex(currentIndex)

            }
            while (currentIndex < data?.length)

            setView(false);
        }
    }, [id, data, view])


    const scrollToBottom = () => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: any) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling to parent
        if (text.trim() === '') return;

        const newMessage: Message = {
            id: messages.length + 1,
            title: "User",
            text,
            position: 'right',
            type: 'text',
            date: new Date()
        };

        setMessages([...messages, newMessage]);
        setText('');
        const values = {
            answer: `User: ${text}`,
            promptId: promptId,
            questionId: data[currentQuestionIndex - 1]?.id
        }
        const response = await sendUserChat(values, token, promptId);
        if (response.data?.chatEnded) {
            setChatEnded(response.data?.chatEnded);
            setGeneratedLink(`http://localhost:3000/chats/${promptId}`)
            if (promptId) {
                await updateForm({ save: 1 }, promptId);
                setFormSubmited(true);
            }
        }

    };
    return (
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', height: "100%" }}>
            <div style={{ flex: '1 1 auto', maxHeight: '400px', overflowY: 'auto' }}>
                {messages.map((msg, index) => {
                    return (
                        // @ts-ignore
                        <MessageBox
                            // id={msg.id}
                            title={msg?.title ?? "User"}
                            key={index}
                            position={msg.position}
                            type={msg.type}
                            text={msg.text}
                            date={msg.date}

                        />
                    );
                })}
                <div ref={messageBoxRef} />
            </div>
            {/* {currentQuestionIndex < questions.length && */}
            {!chatEnded && (!chatEnded && !formSubmited) && <div style={{ marginTop: 20, }}>
                <form onSubmit={handleSend}>
                    <MessageInput text={text} setText={setText} handleSend={handleSend} />
                </form>
            </div>}
        </div>
    );
};


export default ChatBox;

