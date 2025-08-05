import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 
import Layout from '../components/Layout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate(); 
  const [kendala, setKendala] = useState([]); //simpen dan ambil data dari laravel  
  const [kategoriList, setKategoriList] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
  
    // Fetch dua sekaligus
    const fetchData = async () => {
      try {
        const [kendalaRes, kategoriRes] = await Promise.all([
          api.get('http://localhost:8000/api/kendala'),
          api.get('http://localhost:8000/api/kategori-kendala')
        ]);
        setKendala(kendalaRes.data);
        setKategoriList(kategoriRes.data);
      } catch (error) {
        console.error('Gagal ambil data:', error);
      }
    };
  
    fetchData();
  }, []);
  

  // console.log("Total data dari API:", kendala.length);
    
  const totalKendala = kendala.length;
  const diproses = kendala.filter(k => k.status === 'Diproses').length;
  const progres = kendala.filter(k => k.status === 'Progres').length;
  const sedangDiproses = diproses + progres;
  const selesai = kendala.filter(k => k.status === 'Selesai').length;


//   // Grafik per TANGGAL
// const dataPerTanggal = [];
// kendala.forEach(item => {
//   if (item.tanggal_penanganan) {
//     const existing = dataPerTanggal.find(i => i.tanggal === item.tanggal_penanganan);
//     if (existing) {
//       existing.jumlah += 1;
//     } else {
//       dataPerTanggal.push({ tanggal: item.tanggal_penanganan, jumlah: 1 });
//     }
//   }
// });

const dataPerKategori = kategoriList.map((kategori) => { //fungsi baut kelompokin jumlah kendala berdasarkan kategori
  const total = kendala.filter(k => k.kategori_id === kategori.id).length;
  return {
    nama: kategori.nama_kategori,
    total: total,
  };
});

  const recentKendala = [...kendala].sort((a, b) =>
    new Date(b.tanggal_penanganan) - new Date(a.tanggal_penanganan)
  ).slice(0, 5);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Selamat datang! Berikut ringkasan informasi kendala.</p>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-100 p-4 rounded-xl shadow flex items-center gap-4">
            <ClipboardList className="text-indigo-600 w-10 h-10" />
            <div>
              <div className="text-lg font-semibold">{totalKendala}</div>
              <div className="text-sm text-gray-600">Total Kendala</div>
            </div>
          </div>

          <div className="bg-yellow-100 p-4 rounded-xl shadow flex items-center gap-4">
            <Clock className="text-yellow-600 w-10 h-10" />
            <div>
              <div className="text-lg font-semibold">{sedangDiproses}</div>
              <div className="text-sm text-gray-600">Diproses</div>
            </div>
          </div>

          <div className="bg-green-100 p-4 rounded-xl shadow flex items-center gap-4">
            <CheckCircle className="text-green-600 w-10 h-10" />
            <div>
              <div className="text-lg font-semibold">{selesai}</div>
              <div className="text-sm text-gray-600">Selesai</div>
            </div>
          </div>
        </div>

        {/* Grafik */}
        {/* <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Grafik Kendala per Tanggal Penanganan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataPerTanggal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tanggal" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>  */}
         <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Grafik Kategori Kendala</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataPerKategori}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nama" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
</div>

        {/* Tabel Kendala Terbaru */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Kendala Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 text-left">Kode</th>
                  <th className="p-2 text-left">Nama</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Tanggal Penanganan</th>
                </tr>
              </thead>
              <tbody>
                {recentKendala.map((k, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2">{k.kode_pendaftar}</td>
                    <td className="p-2">{k.nama}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        k.status === 'Selesai' ? 'bg-green-200 text-green-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="p-2">{k.tanggal_penanganan}</td>
                  </tr>
                ))}
                {recentKendala.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">Belum ada data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
