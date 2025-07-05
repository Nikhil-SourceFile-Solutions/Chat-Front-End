'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogPanel,
  PopoverGroup,

} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { NavLink, useNavigate } from 'react-router-dom'
import socket,{disconnectSocket,connectSocket} from '../socket';
import axios from 'axios'
import { UserList } from './UserList'
import MessageBox from './MessageBox'
import NewChat from '../NewChat'
import { User } from 'lucide-react'
import ProfileModal from './ProfileModal'


export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [typing, setTyping] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModal, setProfileModal] = useState(false);

  let authUser = localStorage.getItem('user');
  if (authUser) authUser = JSON.parse(authUser);

  // ⛔ Don't call socket() at top level → use inside useEffect or functions only

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      const response = await axios({
        method: 'get',
        url: 'http://xkoggsw080g8so0og4kco4g4.31.97.61.92.sslip.io/api/home-data',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token,
        },
      });

      if (response.data.status === "success") setUsers(response.data.users);
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const sorted = [...users].sort((a, b) => {
        const aTime = new Date(a.lastMessage?.createdAt || 0).getTime();
        const bTime = new Date(b.lastMessage?.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setFilteredUsers(sorted);
    }
  }, [users]);


  useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const userId = JSON.parse(storedUser)?._id;
    if (userId) connectSocket(userId);  // ✅ connect after reload too
  }
}, []);

  useEffect(() => {
    const s = socket();  // Get the current socket safely
console.log("heeeeee")
    if (!s) return;

    const handleTyping = ({ fromUserId }) => setTyping(fromUserId);
    const handleStopTyping = () => setTyping('');
    const handleApple = (data) => console.log("apple", data);

    s.on('typing', handleTyping);
    s.on('stop_typing', handleStopTyping);
    s.on('apple', handleApple);

    return () => {
      s.off('typing', handleTyping);
      s.off('stop_typing', handleStopTyping);
      s.off('apple', handleApple);
    };
  }, []); // If needed, you can adjust dependencies

  useEffect(() => {
    if (selectedUser) {
      const already = users.find(u => u._id === selectedUser._id);
      if (!already) setUsers(prev => [...prev, selectedUser]);
    }
  }, [selectedUser]);


  
  
  
    const [openModal, setOpenModal] = useState(false);
  
  

  return (
    <>
      <header className="bg-[#020621] text-white">
        <nav aria-label="Global" className="mx-auto flex  items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 "
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <PopoverGroup className="hidden lg:flex lg:gap-x-12">


            <NavLink to="/" className="text-sm/6 font-semibold ">
              Chat Home
            </NavLink>

          </PopoverGroup>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">

            <button
              type="button"
              className="flex items-center cursor-pointer gap-x-2 text-sm font-semibold bg-[#371449] text-white px-3 py-2 rounded-lg me-4"

              onClick={() => setProfileModal(!profileModal)}
            >
              <User className="w-4 h-4" />
              {authUser?.name}
            </button>

            <button type='button' onClick={() => {
              disconnectSocket();
              localStorage.removeItem('token');
              localStorage.removeItem('user');
             
              navigate('/login')
            }} className="text-sm/6 font-semibold cursor-pointer bg-[#ff0000] px-3 rounded-lg me-4">
              Logout
            </button>
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <NavLink to={'/'} className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </NavLink>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">

                  <NavLink
                    to="/"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Chat Home
                  </NavLink>


                </div>
                <div className="py-6">
                  <NavLink
                    to="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </NavLink>

                  <NavLink
                    to="/register"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </NavLink>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>

      </header>


      <div className="h-[80vh] text-white bg-[#1a0529] w-full flex flex-col md:flex-row ">
        {/* Sidebar - Chat List */}
        <div
          className={`  md:w-[350px] w-full md:block  border-r border-[#000000] ${selectedUser ? 'hidden md:block' : 'block'
            }`}
        >
          <div className='flex justify-between items-center me-4'>
            <div className="p-4 font-bold text-lg  ">Chats</div>
            <button className='bg-[#371449] px-3 rounded-lg text-sm/6 cursor-pointer' onClick={() => setOpenModal(true)}>New Chat</button>
          </div>
          <ul>
            {filteredUsers.map((user) => (
              <li
                key={user._id}
                className=" cursor-pointer hover:bg-gray-200"
                onClick={() => setSelectedUser(user)}
              >
                {/* {user.name} */}
                <UserList user={user} selectedUser={selectedUser} typing={typing} />
              </li>
            ))}
          </ul>


        </div>

        {/* Main - Chat Content */}
        <div
          className={`flex-1 md:block bg-[#020621] ${selectedUser ? 'block' : 'hidden md:block'
            }`}
        >
          {selectedUser ? (
            <MessageBox selectedUser={selectedUser} setSelectedUser={setSelectedUser} setUsers={setUsers} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>


      <NewChat isOpen={openModal} onClose={setOpenModal} setSelectedUser={setSelectedUser} />

      <ProfileModal isOpen={profileModal} onClose={setProfileModal} />
    </>
  )
}
