"use client"
import { createChat } from '@/services/createChat';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/config/firebaseClient';
import { GptChatDataType } from '@/api/types';
import { convertTimeStampToDate } from '@/utils/dateTimeFormats';
import { sendChat } from '@/services/chat';
import { Input } from 'react-chat-elements';
import { Box, Button } from '@mui/material';
import updateForm from '@/services/updateForm';
import { sendUserChat } from '@/services/sendUserChat';
import MessageList from '@/components/forms/ChatContainer/MessageList';

interface Message {
  id?: string | number;
  title: string;
  position: 'left' | 'right';
  type: any;
  text: string;
  date: Date;
}
export default function Page() {
  // const cookie = cookies();
  // const response = slug && await createChat(slug, token)
  // console.log(response)
  const cookie = Cookies
  const token = cookie.get("token")?.toString();
  const { slug } = useParams();


  const [messages, setMessages] = useState<Message[]>([])
  const [chatEnded, setChatEnded] = useState<boolean>(false);
  const collectionName = 'conversations';
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [data, setData] = useState();
  const [question, setQuestions] = useState([])
  const [view, setView] = useState(slug ? true : false);


  useEffect(() => {

    createChat(slug, token).then((chat) => { setData(chat); })
      .catch((error) => { })

  }, [])


  useEffect(() => {
    let unSubscribed = () => { };
    if (data) {
      const docRef = collection(db, collectionName);
      const q = query(docRef);

      unSubscribed = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          if (change.doc.id == slug) {
            const allDoc = change.doc.data()?.data;
            const currentDoc = allDoc?.find(doc => doc.uid == token);
            const questions = currentDoc.questions;
            const isUpdated = currentDoc.updated;
            if (questions?.length > question.length || isUpdated) {


              let filtered = [];
              let filteredMsg = []
              // setQuestions(questions)

              let currentIndex = messages.length == 1 ? 0 : currentQuestionIndex;
              for (let i = 0; i < questions.length; i++) {
                const element1 = questions[i];
                if (messages?.length > 0)
                  for (let j = 0; j < messages.length; j++) {
                    const element2 = messages[j];
                    if (element1?.id != element2?.id) {
                      console.log("element1", element1)
                      filtered.push(element1);
                    }
                    // setMessages(filtered)
                    filteredMsg = filtered

                    setQuestions(filtered)
                  }
                else
                  // setMessages(questions)
                  filteredMsg = questions
                setQuestions(questions)
              }
            }

          }
        });
      })
    }
    return () => unSubscribed();
  }, [data]);


  // For getting chats from data after when page loaded
  useEffect(() => {
    if (question.length > 0 && !view) {
      // setQuestions(data);
      let currentIndex = messages.length == 1 ? 0 : currentQuestionIndex;

      if (currentIndex < question.length) {


        const title = question[currentIndex]?.question?.text?.split(": ")[0];
        const text = question[currentIndex]?.question?.text?.split(": ")[1]
        const date = convertTimeStampToDate(question[currentIndex].question.createdAt);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            title: title,
            id: question[currentIndex]?.id,
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
  }, [question]);


  // For getting chats from data
  useEffect(() => {
    if (slug && question.length > 0 && view) {
      // setQuestions(data);
      let currentIndex = 0;

      do {

        const element = question[currentIndex];
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
      while (currentIndex < question?.length)

      setView(false);
    }
  }, [slug, question, view])



  const handleSend = async (e, text) => {
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
    const values = {
      answer: `User: ${text}`,
      slug,
      questionId: question[currentQuestionIndex - 1]?.id
    }
    const response = await sendUserChat(values, token, slug);
    if (response.data?.chatEnded) {
      setChatEnded(response.data?.chatEnded);
      // if (slug) {
      //   await updateForm({ save: 1 }, slug);
      //   // setFormSubmited(true);
      // }
    }

  }

  const messageBoxRef = useRef(null);
  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <form onSubmit={handleSend}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', height: "85vh", backgroundColor: "#f3f3f3" }}>
        <div style={{ flex: '1 1 auto', maxHeight: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }} ref={messageBoxRef}>
          <MessageList messages={messages.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).reverse()} />
        </div>
        {!chatEnded && (
          <div style={{ marginTop: 20 }}>
            <MessageInput handleSend={handleSend} />
          </div>
        )}
      </div>
    </form>
  )
}

const MessageInput = React.memo(
  ({ handleSend, }) => {

    const [text, setText] = useState<string>('');
    return (
      <Input
        type='text'
        placeholder="Type your answer..."
        multiline={false}
        maxHeight={300}
        value={text ?? ""}
        onChange={(e) => setText(e.target.value)}
        rightButtons={
          <Button
            type="submit"
            variant='contained'
            color="primary"
            size='small'
            onClick={(e) => {
              handleSend(e, text);
              setText('');
            }}
          >
            Send
          </Button>
        }
      />
    )
  }
)
