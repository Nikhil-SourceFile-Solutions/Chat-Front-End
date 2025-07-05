import axios from 'axios';
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { connectSocket } from '../../socket';
const Login = () => {
  const navigate = useNavigate();
  const [defaultParams] = useState({
    email: '',
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
    if (!params.email) errors = { ...errors, email: "email is required" };
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
        url: 'http://localhost:5000/api/auth/login',
        data,
        headers: {
          'Content-Type': 'application/json',
          // Authorization: "Bearer " + token,
        },
      });

      console.log(response)
      if (response.data.status == "success") {
        localStorage.setItem('token', response.data.token);
        const user=response.data.user;
        localStorage.setItem('user', user);
        const id=JSON.parse(user)._id
        connectSocket(id);
        navigate('/')
      }

      // } else if (response.data.status == "error") {
      //     toast.fire({
      //         icon: 'error',
      //         title: response.data.message,
      //         padding: '10px 20px',
      //         background: '#f44336',
      //         color: 'white',
      //     });
      // }

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
    data.append('email', params.email ? params.email : '');
    data.append('password', params.password ? params.password : '');

    AddOrUpdateApi(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#020621]">
      <div className="w-full m-4 max-w-md p-8 space-y-6 bg-[#371449] rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-white">Login</h2>
        <form className="space-y-4" autoComplete='off'>
          <div>
            <label className="block mb-1 text-sm font-medium text-white">
              Email
            </label>
            <input
              name="email"
              type="email"
              className="w-full px-4 py-2 border text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={params.email}
              onChange={(e) => changeValue(e)}
            />
            {errors?.email && <span className='text-red-600'>{errors.email}</span>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-white">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={params.password}
              onChange={(e) => changeValue(e)}
            />
            {errors?.password && <span className='text-red-600'>{errors.password}</span>}
          </div>
          <button
            type="button"
            className="w-full py-2 mt-4 btn font-semibold text-white bg-[#1a0529] rounded-md hover:bg-[#020621] cursor-pointer"
            onClick={formSubmit}
            disabled={isBtnLoading} 
          >
            {isBtnLoading ? 'Please Wait...' : 'Login'}
          </button>
        </form>
        <div>
          <NavLink className='text-white font-bold cursor-pointer' to={'/register'}> Register Now </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Login;
