import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api'; 
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const KategoriKendala = () => {
  // buat state
  const [kategoriList, setKategoriList] = useState([]);

  // ambil data saat komponen dimuat
  useEffect(() => {
    fetchKategori();
  }, []);

  // fungsi ambil data dari API
  const fetchKategori = async () => {
    try {
      const response = await api.get('/kategori-kendala');
      setKategoriList(response.data);
    } catch (error) {
      console.error('Gagal ambil data:', error);
    }
  };

   // Hapus kategori
   const handleDelete = async (id) => {
    const konfirmasi = window.confirm('Yakin ingin menghapus kategori ini?');
    if (!konfirmasi) return;

    try {
      await api.delete(`/kategori-kendala/${id}`);
      fetchKategori(); // Refresh data setelah hapus
    } catch (error) {
      console.error('Gagal menghapus:', error);
      alert('Terjadi kesalahan saat menghapus data.');
    }
  }; 

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">Daftar Kategori Kendala</h2>
          <Link to="/kategori-kendala/tambah">
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              + Tambah Kategori
            </button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-base text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
              <tr>
                <th className="py-2 px-3">No</th>
                <th className="py-2 px-3">Nama Kategori</th>
                <th className="py-2 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kategoriList.length > 0 ? kategoriList.map((item, index) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 px-3">{index + 1}</td>
                  <td className="py-2 px-3">{item.nama_kategori}</td>
                   <td className="py-2 px-3 flex justify-center gap-2">
                      <Link to={`/kategori-kendala/edit/${item.id}`}>
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-2 rounded" title="Ubah Kategori">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" title="Hapus Kategori"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-500">
                    Tidak ada data kategori
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default KategoriKendala;
