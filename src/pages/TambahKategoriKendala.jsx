import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api'; 
import { FaSave } from 'react-icons/fa';

const TambahKategoriKendala = () => {
  const [nama_kategori, setNamaKategori] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/kategori-kendala', {
        nama_kategori: nama_kategori
      });
      alert('Berhasil tambah kategori');
      navigate('/kategori-kendala');
    } catch (error) {
      console.error('Gagal tambah kategori:', error);
      alert('Gagal menambahkan kategori');
    }
  };

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Tambah Kategori Kendala</h2>
          <button
            onClick={() => navigate('/kategori-kendala')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          >
            Kembali ke daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium mb-1">Nama Kategori</label>
            <input
              type="text"
              name="nama_kategori"
              placeholder="Masukkan nama kategori"
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              value={nama_kategori}
              onChange={(e) => setNamaKategori(e.target.value)}
            />
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

export default TambahKategoriKendala;
