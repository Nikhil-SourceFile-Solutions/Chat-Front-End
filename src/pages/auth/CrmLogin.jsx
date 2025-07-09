import axios from 'axios';
import React, { useEffect } from 'react'
import { connectSocket } from '../../socket';
import { useNavigate } from 'react-router-dom';
export default function CrmLogin({crmData}) {

    const {crmToken,subdomain,user_id}=crmData;
    const navigate = useNavigate();

    useEffect(()=>{
loginApi()
    },[crmData])


    const loginApi=async()=>{
        try {
            
    const response = await axios({
        method: 'get',
        url: `http://${subdomain}.localhost:8000/api/auth/auth-user`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + crmToken,
        },
      });


      if(response.status==200){
        if(user_id=='null' || response?.data?.mongodb==user_id)chatDirectLogin(response?.data?.mongodb);
      }
      console.log(response)
        } catch (error) {
            console.log(error)
        }finally{

        }
    }



    const chatDirectLogin=async(user_id)=>{

        try {

            const response = await axios({
                    method: 'post',
                    url: 'http://api.sourcefile.online/api/auth/direct-login',
                    data:{user_id:user_id,subdomain:subdomain},
                    headers: {
                      'Content-Type': 'application/json',
                      // Authorization: "Bearer " + token,
                    },
                  });

             if (response.data.status == "success") {
                    localStorage.setItem('token', response.data.token);
                    const user=response.data.user;
                    localStorage.setItem('user', user);
                    const id=JSON.parse(user)._id
                    connectSocket(id);
                    navigate('/')
                  }
            
        } catch (error) {
            
        }finally{


        }

    }
    console.log("crmDatacrmDatacrmData",crmData)
return ( <div className="flex items-center justify-center h-screen bg-gray-900 text-white text-2xl">
      Connecting to Chat Box...
    </div>)
}
