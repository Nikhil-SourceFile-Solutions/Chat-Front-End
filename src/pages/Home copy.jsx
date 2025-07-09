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
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import { NavLink } from 'react-router-dom'
import socket from '../socket';
import axios from 'axios'

import Chat from './chat/Index'
export default function Home() {

  const [users,setUsers]=useState([]);
  const [selectedUser,setSelectedUser]=useState(null);
  const token = localStorage.getItem('token');
  const fetchData = async () => {
    
    try {
      const response = await axios({
        method: 'get',
        url: 'http://api.sourcefile.online/api/home-data',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + token,
        },
      });

      if(response.data.status=="success")setUsers(response.data.users)
      console.log(response)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)



  return (
    <>
      <header className="bg-gray-50">
        <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
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
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <PopoverGroup className="hidden lg:flex lg:gap-x-12">


            <NavLink to="/" className="text-sm/6 font-semibold text-gray-900">
              Chat Home
            </NavLink>

          </PopoverGroup>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <NavLink to="/login" className="text-sm/6 font-semibold text-gray-900 me-4">
              Login
            </NavLink>

            <NavLink to="/register" className="text-sm/6 font-semibold text-gray-900 ">
              Register
            </NavLink>
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

   <div className="flex">
  {/* Left section – max width 350px */}
  <div className="w-full max-w-[350px] overflow-y-auto border-r border-gray-200">
    {users?.map((user) => (
      <div key={user._id} className={` ${selectedUser?._id==user._id?'bg-[#a0eaa1]':'bg-gray-50'}  p-2 m-4 rounded-lg shadow-sm`} onClick={()=>setSelectedUser(user)}>
        <b>{user.name}</b> <br />
        <small>{user.phone}</small>
      </div>
    ))}
  </div>

  {/* Right section – takes the rest of the space */}
  <div className="flex-1 p-4">
    <Chat user={selectedUser} setUser={setSelectedUser}/>
  </div>
</div>

     
    </>
  )
}
