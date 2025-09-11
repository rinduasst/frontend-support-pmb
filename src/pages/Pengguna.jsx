import React, { useEffect, useState } from 'react';
import api from '../api'; 
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/solid';

const Pengguna = () => {
  const [pengguna, setPengguna] = useState([]);

  useEffect(() => {
    api.get('/pengguna')
      .then(response => setPengguna(response.data))
      .catch(error => console.error('Gagal ambil data:', error));
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Yakin ingin menghapus pengguna ini?');
    if (confirmDelete) {
      try {
        await api.delete(`/pengguna/${id}`);
        setPengguna(pengguna.filter(item => item.id !== id));
        alert('Pengguna berhasil dihapus');
      } catch (error) {
        console.error("Gagal hapus pengguna:", error.response?.data?.message || error.message);
        alert(error.response?.data?.message || "Gagal hapus pengguna karena sedang menangani kendala");
      }
    }
  };

  return (
    <Layout>
     
      <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Daftar Pengguna</h2>
            <Link to="/pengguna/tambah">
              <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                + Tambah Pengguna
              </button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-base text-left">
              <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                <tr>
                  <th className="py-2 px-3">No</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Nama</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pengguna.length > 0 ? pengguna.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 px-3">{item.email}</td>
                    <td className="py-2 px-3">{item.nama_pengguna}</td>
                    <td className="py-2 px-3">
                      {item.status === 'Aktif' ? (
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-semibold">
                          Aktif
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-semibold">
                          Tidak Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 flex justify-center gap-2">
                      <Link to={`/pengguna/edit/${item.id}`}>
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-2 rounded" title="Ubah">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link to={`/pengguna/ubah-password/${item.id}`}>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-2 rounded" title="Ubah Password">
                          <KeyIcon className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" title="Hapus"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-500">
                      Tidak ada data pengguna
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

export default Pengguna;
