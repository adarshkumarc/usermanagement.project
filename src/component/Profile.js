import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({ username: '', email: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      setFormData({ username: response.data.username, email: response.data.email });
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const response = await axios.put('http://localhost:3000/api/users/profile', formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProfile(response.data);
    alert('Profile updated successfully');
  };

  return (
    <div>
      <h2>Profile</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" value={formData.username} onChange={handleChange} />
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
