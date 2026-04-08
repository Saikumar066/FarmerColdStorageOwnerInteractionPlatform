// src/components/FarmerRegister.tsx
import axios from 'axios';
import { useState } from 'react';

const FarmerRegister = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/farmers/register', {
        name,
        phone,
        password,
      });
      alert(response.data.message);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Register</button>
    </form>
  );
};

export default FarmerRegister;
