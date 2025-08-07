import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; 
import Layout from '../components/Layout';
import { FaSave } from 'react-icons/fa';

const EditPengguna = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama_pengguna: '',
    email: '',
    status: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/pengguna/${id}`);
        setFormData({
          nama_pengguna: res.data.nama_pengguna,
          email: res.data.email,
          status: res.data.status,
        });
      } catch (error) {
        console.error('Gagal mengambil data pengguna:', error);
        alert('Data pengguna tidak ditemukan');
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/pengguna/${id}`, formData);
      alert('Data pengguna berhasil diperbarui');
      navigate('/pengguna');
    } catch (error) {
      console.error('Gagal mengupdate pengguna:', error);
      alert(error.response?.data?.message || 'Gagal update pengguna');
    }
  };

  return (
    <Layout>
     
     <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Edit Data Pengguna</h2>
            <button
              onClick={() => navigate('/pengguna')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              Kembali ke daftar
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium mb-1">Nama Pengguna</label>
              <input
                type="text"
                name="nama_pengguna"
                value={formData.nama_pengguna}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              />
            </div>
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
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
    </Layout>
  );
};

export default EditPengguna;
