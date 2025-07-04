import axios from 'axios';
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Login = () => {

  const navigate=useNavigate();

    const [defaultParams] = useState({
      name:'',
          email: '',
          phone:'',
          password: ''
      });

    const [params, setParams] = useState(defaultParams);


    const [errors, setErrors] = useState({});

        const changeValue = (e) => {
            const { value, name } = e.target;
            setErrors({ ...errors, [name]: "" });
            setParams({ ...params, [name]: value });
        };


         const validate = () => {
        setErrors({});
        let errors = {};
         if (!params.name) errors = { ...errors, name: "name is required" };
        if (!params.email) errors = { ...errors, email: "email is required" };
         if (!params.phone) errors = { ...errors, phone: "phone is required" };
        if (!params.password) errors = { ...errors, password: "password is required" };
        setErrors(errors);
        return { totalErrors: Object.keys(errors).length };
    };

        const [isBtnLoading, setIsBtnLoading] = useState(false)


          const AddOrUpdateApi = async (data) => {
           
                setIsBtnLoading(true)
                try {
                    const response = await axios({
                        method: 'post',
                        url: 'http://localhost:5000/api/auth/register',
                        data,
                        headers: {
                            'Content-Type': 'application/json',
                            // Authorization: "Bearer " + token,
                        },
                    });

                    if (response.data.status == "success") {
                       setParams(defaultParams)
                       navigate('/login')
        
                    } else if (response.data.status == "error") {
                       
                    }
        
                } catch (error) {
                    if (error?.response?.status == 401) logout()
        
                    if (error?.response?.status === 422) {
                        const serveErrors = error.response.data.errors;
                        let serverErrors = {};
                        for (var key in serveErrors) {
                            serverErrors = { ...serverErrors, [key]: serveErrors[key][0] };
                        }
                        setErrors(serverErrors);
                    }

                    console.log(error)
        
                } finally {
                    setIsBtnLoading(false)
                }
            }
        
            const formSubmit = () => {
           
                const isValid = validate();
                if (isValid.totalErrors) return false;
                const data = new FormData();
                  data.append('name', params.name ? params.name : '');
                    data.append('email', params.email ? params.email : '');
                 data.append('phone', params.phone ? params.phone : '');
                data.append('password', params.password ? params.password : '');
               
                AddOrUpdateApi(data);
            };
        
        



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>
        <form  className="space-y-4">
            <div>
            <label  className="block mb-1 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
            name="name"
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={params.name}
              onChange={(e) => changeValue(e)}
            />
              {errors?.name && <span className='text-red-600'>{errors.name}</span>}
          </div>
          <div>
            <label  className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
            name="email"
              type="email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={params.email}
              onChange={(e) => changeValue(e)}
            />
              {errors?.email && <span className='text-red-600'>{errors.email}</span>}
          </div>

            <div>
            <label  className="block mb-1 text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
            name="phone"
              type="phone"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={params.phone}
              onChange={(e) => changeValue(e)}
            />
              {errors?.phone && <span className='text-red-600'>{errors.phone}</span>}
          </div>

          <div>
            <label  className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={params.password}
              onChange={(e) => changeValue(e)}
            />
            {errors?.password && <span className='text-red-600'>{errors.password}</span>}
          </div>
          <button
            type="button"
            className="w-full py-2 btn font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
            onClick={formSubmit}
            disabled={isBtnLoading}
          >
           {isBtnLoading?'Please Wait...':'Register'} 
          </button>
        </form>

         <div>
         <NavLink className='text-[#00a9f2] font-bold' to={'/login'}>Login</NavLink>
        </div>
      </div>
    </div>
  );
};

export default Login;
