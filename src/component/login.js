import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', otp: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post('http://localhost:3000/api/users/login', formData);
    localStorage.setItem('token', response.data.token);
    alert('Login successful');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} />
      <input type="text" name="otp" placeholder="OTP" onChange={handleChange} />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
