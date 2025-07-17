import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from '../components/Layout';
import api from '../api'; 
import { FaSave } from "react-icons/fa";


const UbahKategoriKendala = ()=>{
    const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    nama_kategori: '',
  });

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    try {
      const response = await api.get(`http://localhost:8000/api/kategori-kendala/${id}`);
      setFormData({ nama_kategori: response.data.nama_kategori });
    } catch (error) {
      console.error('Gagal ambil data kategori:', error);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`http://localhost:8000/api/kategori-kendala/${id}`, formData);
      alert('Kategori kendala berhasil diperbarui');
      navigate('/kategori-kendala');
    } catch (error) {
      console.error('Gagal update kategori:', error);
    }
  };

return(
    <Layout>
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Ubah Kategori Kendala</h2>
        <button
          onClick={() => navigate('/kategori-kendala')}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Kembali ke daftar
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Kategori Kendala</label>
          <input
            type="text"
            name="nama_kategori"
            value={formData.nama_kategori}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          />
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
)
};

export default UbahKategoriKendala;