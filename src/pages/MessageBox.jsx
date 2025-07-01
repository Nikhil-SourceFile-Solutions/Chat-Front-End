import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import socket from '../socket';
import { User, Users } from 'lucide-react';

export default function MessageBox({ selectedUser, setSelectedUser }) {

  const handleBack = () => setSelectedUser(null);

  const token = localStorage.getItem('token');


  const [chats, setChats] = useState([]);
  const fetchChat = async () => {

    try {
      const response = await axios({
        method: 'get',
        url: 'http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/api/chat-data',
        params: { _id: selectedUser?._id },
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token,
        },
      });

      if (response.data.status == "success") {
        setSelectedUser(response.data.user)

        setChats(response.data.chats)
      }
    } catch (error) {
      console.log(error)
    } finally {

    }


  }

  useEffect(() => {

    if (selectedUser?._id) fetchChat()
  }, [selectedUser?._id])

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    if (!message) return;
    try {
      const response = await axios({
        method: 'post',
        url: 'http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/api/messages',
        data: {
          receiver_id: selectedUser._id,
          message: message,
          type: 'text',
          data: '',
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token,
        },
      });

      if (response.data.status == "success") {

        const sound = new Audio('/assets/outgoing.mp3');
        sound.play().catch((error) => {
          console.warn('Audio autoplay blocked:', error);
        });

        setMessage('')
        fetchChat()
      }

      console.log(response)

    } catch (error) {
      console.log(error)
    }
  };



  useEffect(() => {

    socket.on('receive_message', (message) => {

      setChats((prevChats) => [...prevChats, message]);

      const sound = new Audio('/assets/incoming.mp3');
      sound.play().catch((error) => {
        console.warn('Audio autoplay blocked:', error);
      });

    });



    return () => {
      socket.off('receive_message');
    };
  }, []);


  const typingTimeoutRef = useRef(null);

  const handleTyping = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    socket.emit('typing', { toUserId: selectedUser?._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { toUserId: selectedUser?._id });
    }, 500);
  };


  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.on('typing', ({ fromselectedUserId }) => {
      setIsTyping(true);
    });

    socket.on('stop_typing', ({ fromselectedUserId }) => {
      setIsTyping(false);
    });

    return () => {
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, []);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, isTyping]);

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  return (
    <div className="flex flex-col h-full">
      {/* Mobile Only Back Button */}
      <div className="md:hidden p-4 bg-[#1a0529] flex items-center gap-4">
        <button
          onClick={handleBack}
          className="text-white font-bold"
        >
          ←
        </button>




        <span className="font-bold">{selectedUser.name}</span>
      </div>

      {/* Chat Header */}


      <div className='hidden md:block p-3 bg-[#1a0529]'>
        <div className="flex items-center gap-3 ">
          {/* Avatar */}
          <div className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center">
            <User className="h-5 w-5 text-white opacity-70" />
          </div>

          {/* Name & Message Info */}
          <div>
            <div className="text-white font-semibold text-sm">{selectedUser?.name}</div>
            <div className="text-gray-400 font-medium text-xs flex items-center gap-1">
              {isTyping ? 'typing ....' : selectedUser?.isActive ? (
                <span className="text-green-500">Online</span>
              ) : (
                selectedUser?.lastActiveReadable
              )}

            </div>
          </div>
        </div>
      </div>



      {/* Chat Content */}
      <div className="flex-1 p-4 px-6 overflow-auto custom-scrollbar">

        {chats?.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet.</div>
        ) : (
          chats.map((chat, i) => (
            <div
              key={i}
              className={`flex ${chat.receiver_id === selectedUser._id ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`p-2 rounded-lg break-words whitespace-pre-wrap max-w-xs text-white ${chat.receiver_id === selectedUser._id ? 'bg-[#102d45]' : 'bg-[#371449]'
                  }`}
                style={{ wordBreak: 'break-word' }}
              >
                <div>
                  {chat.message}
                </div>

                {/* Footer row for time + tick */}
                <div className="flex justify-end items-center gap-1 text-xs text-gray-400 mt-1">
                  <span>{formatTime(chat.createdAt)}</span>

                  {!chat.isViewed ? (<svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 13l3 3L20 6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13l3 3"
                    />
                  </svg>) : !chat.isReceived ? (<svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 13l3 3L20 6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13l3 3"
                    />
                  </svg>) : (<svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>)}

                </div>
              </div>
            </div>





          ))
        )}
        {isTyping && <div className="text-sm text-gray-400 mt-2">typing....</div>}
        {/* 👇 Dummy div to scroll into view */}
        <div ref={bottomRef}></div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-2 bg-[#1a0529] z-10 sm:static sm:z-0">
        <form className="flex gap-2" onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-lg px-3 py-2 focus:outline-none"
            value={message}
            onChange={handleTyping}
          />
          <button
            type="submit" // changed to submit for Enter key support
            className="bg-[#371449] text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
