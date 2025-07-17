import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; 
import { useState } from 'react';
import Layout from '../components/Layout';

const UbahPassword = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi tidak cocok!');
      return;
    }

    try {
      await api.put(`http://localhost:8000/api/pengguna/${id}/ubah-password`, {
        old_password: oldPassword,
        password: newPassword,
      });
      alert('Password berhasil diubah');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigate('/pengguna'); // Redirect setelah sukses
    } catch (error) {
      console.error("RESPON ERROR:", error.response?.data);
      alert(error.response?.data?.message || "Gagal mengubah password");
    }
  };

  return (
    <Layout>
    
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Ubah Password Pengguna</h2>
            <button
              onClick={() => navigate('/pengguna')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
            >
              Kembali
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password Lama</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      
    </Layout>
  );
};

export default UbahPassword;
