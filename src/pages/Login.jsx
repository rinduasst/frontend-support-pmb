import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/login', formData);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403) {
        alert("Akun Anda tidak aktif. Hubungi admin.");
      } else {
        alert("Login gagal. Cek email dan password.");
      }
    }
    
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/login.png')] bg-cover bg-center opacity-70"></div>
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <img src="/uika.png" alt="Logo" className="mx-auto h-20" />
          <h1 className="text-2xl font-bold text-gray-800">Support PMB</h1>
 
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
          
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Masukkan email "
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
            />
         

          </div>
          <div>
          <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
               Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Masukan Password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember">Ingat saya</label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300"
          >
            Login
          </button>
        </form>

        
      </div>
    </div>
  );
};

export default Login;
