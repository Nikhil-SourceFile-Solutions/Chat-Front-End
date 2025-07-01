import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import socket from '../socket';

export default function MessageBox({selectedUser,setSelectedUser}) {

      const handleBack = () => setselectedUser(null);

        const token = localStorage.getItem('token');
      
          console.log(selectedUser?._id)
      
      
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
              if(!message) return;
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
      
                  if(response.data.status=="success"){
                    
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
      
      
        const typingTimeoutRef =useRef(null);
      
         const handleTyping = (e) => {
          const newMessage = e.target.value;
          setMessage(newMessage);
          socket.emit('typing', { toUserId: selectedUser?._id }); 
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { toUserId:  selectedUser?._id });
          }, 1000);
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
        }, [chats,isTyping]);
  return (
    <div className="flex flex-col h-full">
            {/* Mobile Only Back Button */}
            <div className="md:hidden p-4 bg-gray-200 flex items-center gap-2">
              <button
                onClick={handleBack}
                className="text-blue-600 font-semibold"
              >
                ← Back
              </button>
              <span className="font-bold">{selectedUser.name}</span>
            </div>

            {/* Chat Header */}
            <div className="hidden md:block p-4 bg-[#1a0529] font-bold border-b border-[#000000]">
              {selectedUser.name}
            </div>

            {/* Chat Content */}
            <div className="flex-1 p-4 px-6 overflow-auto">
              
      {chats?.length === 0 ? (
        <div className="text-center text-gray-400">No messages yet.</div>
      ) : (
        chats.map((chat, i) => (
          <div
            key={i}
            className={`flex ${chat.receiver_id === selectedUser._id ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div
              className={`p-2 rounded-lg break-words whitespace-pre-wrap max-w-[75%] text-white ${
                chat.receiver_id === selectedUser._id ? 'bg-blue-500' : 'bg-gray-500'
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

            {/* Message Input */}
            <div className="p-2 bg-[#1a0529]">
              <form className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg px-3 py-2  focus:outline-none"
                   value={message}
                       onChange={handleTyping}
                />
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  onClick={sendMessage}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
  )
}
