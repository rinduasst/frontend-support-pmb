import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api'; 
import { FaSave } from 'react-icons/fa';

const TambahPengguna = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    nama_pengguna: '',
    no_telp: '',
    status: '',
  });

  const navigate = useNavigate();
  const [errors, setErrors] = useState({}); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const res = await api.post('http://localhost:8000/api/pengguna', formData);
      console.log("Sukses simpan:", res.data); // Tambahkan ini
      navigate('/pengguna');
    } catch (err) {
      console.error('Gagal menyimpan data:', err.response?.data || err.message);
      alert('Gagal menyimpan data');
    }
  };
  

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Tambah Data Pengguna</h2>
          <button
            onClick={() => navigate('/pengguna')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            Kembali ke daftar
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Masukan Email"
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {/* <div>
            <label className="block font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Masukan Username"
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              value={formData.username}
              onChange={handleChange}
            />
          </div> */}
          <div>
            <label className="block font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Masukan Password"
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Nama Pengguna</label>
            <input
              type="text"
              name="nama_pengguna"
              placeholder="Masukan Nama Pengguna"
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              value={formData.nama_pengguna}
              onChange={handleChange}
            />
          </div>
          {/* <div>
            <label className="block font-medium mb-1">No. Telp</label>
            <input
              type="text"
              name="no_telp"
              placeholder="Masukan No. Telp"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              value={formData.no_telp}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,13}$/.test(value)) {
                  setFormData({ ...formData, no_telp: value });
                }
              }}
            />
          </div> */}
          <div>
            <label className="block font-medium mb-1">Status</label>
            <div className="flex gap-10 mt-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="Aktif"
                  checked={formData.status === 'Aktif'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Aktif
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="Tidak Aktif"
                  checked={formData.status === 'Tidak Aktif'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Tidak Aktif
              </label>
            </div>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded inline-flex items-center"
            >
              <FaSave className="mr-2" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TambahPengguna;
