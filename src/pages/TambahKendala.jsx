import React, { useState, useEffect } from 'react';
import api from '../api'; 
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const TambahKendala = () => {
  const [saranKode, setSaranKode] = useState([]);
  const [kodePendaftar, setKodePendaftar] = useState('');
  const [riwayatKendala, setRiwayatKendala] = useState([]);
  const [status_pendaftar, setStatus_pendaftar] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dataPetugas, setDataPetugas] = useState([]);
  const navigate = useNavigate();
  const [kategoriList, setKategoriList] = useState([]);
  
  // --- UPDATE: Tambahkan fakultas dan pilihan_pertama di state awal ---
  const [formData, setFormData] = useState({
    status_pendaftar: '',
    kode_pendaftar: '',
    nama: '',
    fakultas: '',          // Tambahan baru
    pilihan_pertama: '',   // Tambahan baru
    kendala: '',
    tindak_lanjut: '',
    no_wa: '',
    status: 'Progres',
    tanggal_penanganan: '',
    tanggal_selesai: '',
    petugas_id: '',
    kategori_id: ''
  });

  useEffect(() => {
    const fetchPetugas = async () => {
      try {
        const response = await api.get('/petugas');
        // --- PERBAIKAN: Pastikan formatnya selalu Array ---
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setDataPetugas(data);
      } catch (error) {
        console.error('Gagal fetch petugas:', error);
      }
    };

    fetchPetugas();
  }, []);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const response = await api.get('/kategori-kendala');
        // --- PERBAIKAN: Pastikan formatnya selalu Array ---
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setKategoriList(data);
      } catch (error) {
        console.error('Gagal ambil data kategori:', error);
      }
    };
  
    fetchKategori();
  }, []);
    
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'kode_pendaftar') {
      if (/^\d*$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (
      formData.status_pendaftar === 'pendaftar' &&
      (!formData.kode_pendaftar || !/^\d+$/.test(formData.kode_pendaftar))
    ) {
      alert('Kode pendaftar harus berupa angka.');
      return;
    }
  
    const dataToSubmit = {
      ...formData,
      kode_pendaftar:
        formData.status_pendaftar === 'pendaftar' ? formData.kode_pendaftar : '',
      petugas_id: formData.petugas_id ? parseInt(formData.petugas_id) : null,
    };

    setPendingData(dataToSubmit);
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/kendala', pendingData);
      setShowConfirm(false);
      alert('Data berhasil ditambahkan');
      navigate('/kendala');
    } catch (error) {
      console.error('Gagal menambahkan kendala', JSON.stringify(error.response?.data, null, 2));
      setShowConfirm(false);
      alert('Gagal menambahkan data');
    } finally {
      setIsSaving(false);
    }
  };
  
  useEffect(() => {
    const fetchSaran = async () => {
      if (kodePendaftar.length >= 3) {
        try {
          const res = await api.get(`/pendaftar/search?kode=${kodePendaftar}`);

          const uniqueSuggestions = [];
          const seen = new Set();

          res.data.forEach(item => {
            if (!seen.has(item.kode_pendaftar)) {
              seen.add(item.kode_pendaftar);
              uniqueSuggestions.push(item);
            }
          });

          setSaranKode(uniqueSuggestions);
        } catch (err) {
          console.error('Gagal fetch saran kode:', err);
          setSaranKode([]);
        }
      } else {
        setSaranKode([]);
      }
    };

    fetchSaran();
  }, [kodePendaftar]);

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Tambah Kendala</h2>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => window.history.back()}
            >
              Kembali ke daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="block font-medium mb-1">Status Pendaftar</label>
              <select
                name="status_pendaftar"
                value={formData.status_pendaftar}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, status_pendaftar: value });
                  setStatus_pendaftar(value);
                  if (value === 'peminat') {
                    setFormData((prev) => ({ ...prev, kode_pendaftar: '' }));
                  }
                }}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                required
              >
                <option value="">-- Pilih Status Pendaftar --</option>
                <option value="peminat">Peminat</option>
                <option value="pendaftar">Pendaftar</option>
              </select>
                      
            {status_pendaftar === 'pendaftar' && (
              <>
                <label className="block font-medium mb-1 mt-4">Kode Pendaftar</label>
                <input
                type="text"
                value={kodePendaftar} maxLength={15}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setKodePendaftar(value);
                    setFormData((prev) => ({
                      ...prev,
                      kode_pendaftar: value
                    }));
                  }
                }}
                placeholder="Masukkan Kode Pendaftar"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              />
              
              {saranKode.length > 0 && (
                <ul className="absolute bg-white border rounded mt-1 shadow max-h-40 overflow-y-auto z-10 ">
                 {saranKode.map((item, index) => (
                <li
                  key={`${item.kode_pendaftar}-${index}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setKodePendaftar(item.kode_pendaftar);
                    setFormData((prev) => ({
                      ...prev,
                      kode_pendaftar: item.kode_pendaftar,
                      nama: item.nama,
                      no_wa: item.no_wa
                    }));
                    setSaranKode([]);
                  }}
                >
                  {item.kode_pendaftar} - {item.nama}
                </li>

                  ))}
                </ul>
              )}
            </>
          )}

              <label className="block font-medium mb-1 mt-4">Nama</label>
              <input
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                placeholder="Masukkan Nama"
              />

              {/* --- UPDATE: Input Fakultas --- */}
              <label className="block font-medium mb-1 mt-4">Fakultas</label>
              <select
                name="fakultas"
                value={formData.fakultas}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              >
                <option value="">-- Pilih Fakultas --</option>
                <option value="FAI">Agama Islam (FAI)</option>
                <option value="FE">Ekonomi dan Bisnis (FE)</option>
                <option value="FT">Teknik dan Sains (FT)</option>
                <option value="FKIP">Keguruan dan Ilmu Pendidikan (FKIP)</option>
                <option value="FH">Hukum (FH)</option>
                <option value="FIKES">Ilmu Kesehatan (FIKES)</option>
              </select>

              {/* --- UPDATE: Input Pilihan Pertama --- */}
              <label className="block font-medium mb-1 mt-4">Pilihan Pertama (Prodi)</label>
              <input
                name="pilihan_pertama"
                value={formData.pilihan_pertama}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                placeholder="Contoh: Teknik Informatika"
              />

            </div>
            
            {/* Kolom Kanan */}
            <div>
            <label className="block font-medium mb-1">Kategori Kendala</label>
            <select
              name="kategori_id"
              value={formData.kategori_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {kategoriList.map((kategori) => (
                <option key={kategori.id} value={kategori.id}>
                  {kategori.nama_kategori}
                </option>
              ))}
            </select>
 
              <label className="block font-medium mb-1 mt-4">Deskripsi Kendala</label>
              <textarea
                name="kendala"
                value={formData.kendala}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                placeholder="Masukan kendala"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">No. WA</label>
              <input
                type="text"
                name="no_wa"
                value={formData.no_wa}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,13}$/.test(value)) {
                    setFormData({ ...formData, no_wa: value });
                  }
                }}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                placeholder="Masukkan No. WA"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Tindak Lanjut</label>
              <input
                name="tindak_lanjut"
                value={formData.tindak_lanjut}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                placeholder="Masukkan Catatan"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Status Kendala</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              >
                <option value="Progres">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Petugas</label>
              <select
                name="petugas_id"
                value={formData.petugas_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                required
              >
                <option value="">-- Pilih Petugas --</option>
                {dataPetugas.map((petugas) => (
                  <option key={petugas.id} value={petugas.id}>
                    {petugas.nama_pengguna}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Tanggal Penanganan</label>
              <input
                type="date"
                name="tanggal_penanganan"
                value={formData.tanggal_penanganan}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Tanggal Selesai</label>
              <input
                type="date"
                name="tanggal_selesai"
                value={formData.tanggal_selesai}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              />
            </div>

            <div className="md:col-span-2 text-right">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">Konfirmasi Simpan</h3>
              <p className="text-gray-600 mb-6">
                Yakin ingin menyimpan data kendala ini? Notifikasi WhatsApp pengingat akan otomatis dikirim ke nomor yang diisi.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Ya, Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}
    </Layout>
  );
};

export default TambahKendala;