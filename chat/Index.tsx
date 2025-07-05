import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import socket from '../../socket';

export default function Index({ user, setUser }) {
  const token = localStorage.getItem('token');

  console.log(user?._id)


  const [chats, setChats] = useState([]);
  const fetchChat = async () => {

    try {
      const response = await axios({
        method: 'get',
        url: 'http://localhost:5000/api/chat-data',
        params: { _id: user?._id },
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token,
        },
      });

      if (response.data.status == "success") {
        setUser(response.data.user)

        setChats(response.data.chats)
      }
    } catch (error) {
      console.log(error)
    } finally {

    }


  }

  useEffect(() => {

    if (user?._id) fetchChat()
  }, [user?._id])



  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);



  const sendMessage = async () => {
    // socket.emit('send_message', { message });
    // setMessage('');

    // 

    if (!message) return;

    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:5000/api/messages',
        data: {
          receiver_id: user._id,
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
      setIsTyping(false);
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
    socket.emit('typing', { toUserId: user?._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { toUserId: user?._id });
    }, 1000);
  };


  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.on('typing', ({ fromUserId }) => {
      setIsTyping(true);
    });

    socket.on('stop_typing', ({ fromUserId }) => {
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

  return (
    <div className="bg-gray-50 m-4 rounded-lg  h-[80vh] flex flex-col justify-between">

      {/* ✅ Header: User Info */}
      <div className="flex justify-between items-center bg-[#527ea4] text-white p-2 pb-2 rounded-lg">
        <div className="flex gap-4 items-center">
          <img
            className="w-[50px] h-[50px] rounded-full"
            src={`https://ui-avatars.com/api/?background=black&color=fff&name=${user?.name}`}
            alt="User"
          />
          <div>
            <p><b>{user?.name}</b></p>
            <small className="text-white">
              {user?.isActive ? 'Active' : user?.lastActiveReadable}
            </small>
          </div>
        </div>
        <div>
          {/* Right section if needed */}
          <span className="text-sm text-white">Right</span>
        </div>
      </div>
      {/* {chat.map((m, i) => <div key={i}>{m.message}</div>)} */}
      {/* ✅ Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-2">
        {chats?.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet.</div>
        ) : (
          chats.map((chat, i) => (
            <div
              key={i}
              className={`flex ${chat.receiver_id === user._id ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`p-2 rounded-lg max-w-xs text-white ${chat.receiver_id === user._id ? 'bg-blue-500' : 'bg-gray-500'
                  }`}
              >
                {chat.message}
              </div>
            </div>
          ))
        )}
        {isTyping && <div className="text-sm text-gray-400 mt-2">typing....</div>}
        {/* 👇 Dummy div to scroll into view */}
        <div ref={bottomRef}></div>
      </div>

      {/* ✅ Chat Input Area */}
      <div className="bg-[#527ea4] rounded-lg p-2 mt-4">
        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            className="flex-1  rounded-lg px-3 py-2 focus:outline-none focus:ring-0 focus:ring-none"
          />
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600" onClick={sendMessage}
          >
            Send
          </button>
        </form>
      </div>

    </div>

  )
}
