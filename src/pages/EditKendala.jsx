import { useState, useEffect } from 'react';
import api from '../api'; 
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

const EditKendala = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
   status_pendaftar:'',
    kode_pendaftar: '',
    nama: '',
    kendala: '',
    tindak_lanjut: '',
    no_wa: '',
    status: 'Progres',
    tanggal_penanganan: '',
    tanggal_selesai: '',
    petugas_id: '',
    kendalaBaru: '',
    kategori_id:''
  });
  
  
  const [showTambahKendala, setShowTambahKendala] = useState(false);
  const [dataPetugas, setDataPetugas] = useState([]);
  const [logPetugas, setLogPetugas] = useState([]);
  const [KategoriList, setKategoriList] = useState([]);
  const [formKendalaBaru, setFormKendalaBaru] = useState({
    kendala: '',
    tindak_lanjut: '',
    petugas_id: '',
    tanggal_penanganan: '',
    tanggal_selesai: '',
    kategori_id:''
  });
  

useEffect(() => {
  const fetchData = async () => {
    try {
      const petugasRes = await api.get('http://localhost:8000/api/petugas');
      setDataPetugas(petugasRes.data);

      const kategoriList = await api.get('http://localhost:8000/api/kategori-kendala');
      setKategoriList(kategoriList.data);

      const kendalaRes = await api.get(`http://localhost:8000/api/kendala/${id}`);
      const data = kendalaRes.data;
 
      

      setFormData({
        status_pendaftar: data.status_pendaftar || '',
        kode_pendaftar: data.kode_pendaftar || '',
        nama: data.nama || '',
        kendala: data.kendala || '',
        tindak_lanjut: data.tindak_lanjut || '',
        no_wa: data.no_wa || '',
        status: data.status || 'Progres',
        tanggal_penanganan: data.tanggal_penanganan || '',
        tanggal_selesai: data.tanggal_selesai || '',
        petugas_id: data.petugas?.id || '',
        kategori_id: data.kategori?.id||''

      });
      
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    }
  };

  fetchData();
}, [id]);


const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === 'no_wa' && value && !/^\d{10,13}$/.test(value)) {
    alert('Nomor WA harus 10–13 digit angka');
    return;
  }

  setFormData({ ...formData, [name]: value });
};
const handleUpdateKendala = async () => {
  // Validasi kode_pendaftar jika status adalah "pendaftar"
  console.log('Status yang dikirim:', formData.status);

  if (formData.status_pendaftar === 'pendaftar') {
    if (!formData.kode_pendaftar || isNaN(formData.kode_pendaftar)) {
      alert('Kode pendaftar wajib diisi dan harus berupa angka.');
      return;
    }
  }
  

  const payload = {
    status_pendaftar: formData.status_pendaftar,
    kode_pendaftar: formData.status_pendaftar === 'pendaftar' ? formData.kode_pendaftar : null,
    nama: formData.nama,
    kendala: formData.kendala,
    tindak_lanjut: formData.tindak_lanjut,
    no_wa: formData.no_wa,
    status: formData.status,
    tanggal_penanganan: formData.tanggal_penanganan,
    tanggal_selesai: formData.tanggal_selesai,
    petugas_id: formData.petugas_id,
    kategori_id: formData.kategori_id,
  };

  try {
    const res = await api.put(`http://localhost:8000/api/kendala/${id}`, payload);
    alert('Data kendala berhasil diperbarui.');
    navigate('/kendala', { state: { updated: true } });
  } catch (error) {
    console.error('Gagal update data kendala', error.response?.data);
    alert('Gagal memperbarui data kendala.');
  }
};

const handleTambahKendalaBaru = async () => {
  if (!formKendalaBaru.kendala?.trim()) {
    alert("Isi kendala baru terlebih dahulu.");
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  const newKendala = {
    status_pendaftar: formData.status_pendaftar,
    kode_pendaftar: formData.status_pendaftar === 'pendaftar' ? formData.kode_pendaftar : null,
    nama: formData.nama,
    kendala: formKendalaBaru.kendala,
    tindak_lanjut: formKendalaBaru.tindak_lanjut || '',
    no_wa: formData.no_wa,
    status: formKendalaBaru.status ||'Progres',
    tanggal_penanganan: formKendalaBaru.tanggal_penanganan || today,
    tanggal_selesai: formKendalaBaru.tanggal_selesai || today,
    petugas_id: formKendalaBaru.petugas_id || null,
    kategori_id: formKendalaBaru.kategori_id || null
  };

  try {
    await api.post(`http://localhost:8000/api/kendala`, newKendala);
    alert("Kendala baru berhasil ditambahkan.");
    navigate('/kendala');


    setFormKendalaBaru({
      kendala: '',
      tindak_lanjut: '',
      petugas_id: '',
      status:'',
      tanggal_penanganan: '',
      tanggal_selesai: '',
      kategori_id:''
    });

    setShowTambahKendala(false);

  } catch (error) {
    console.error('Gagal menambahkan kendala baru', error.response?.data);
    alert('Gagal menambahkan kendala.');
  }
};
const [riwayatKendala, setRiwayatKendala] = useState([]);

useEffect(() => {
  if (formData.kode_pendaftar) {
    api.get(`http://localhost:8000/api/kendala/kode/${formData.kode_pendaftar}`)
      .then(res => {
        const semuaKendala = res.data;

        // Filter riwayat: buang kendala yang sedang diedit (pakai id)
        const riwayat = semuaKendala.filter(k => k.id !== parseInt(id));
        setRiwayatKendala(riwayat);
      })
      .catch(err => {
        console.error('Gagal mengambil riwayat kendala:', err);
      });
  }
}, [formData.kode_pendaftar, id]);




  
  return (
    <Layout>
    <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Edit Kendala</h2>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => navigate(-1)}
          >
            Kembali ke daftar
          </button>
        </div>
  
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 mb-2">
          </div>
          <div>
          <label className="block font-medium mb-1">Status Pendaftar</label>
          <select value={formData.status_pendaftar} 
                onChange={(e) => setFormData({ ...formData, status_pendaftar: e.target.value })}               
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              >
                <option value="peminat">Peminat</option>
                <option value="pendaftar">Pendaftar</option>
              </select>

              {formData.status_pendaftar === 'pendaftar' && (
                <>
                
                  <label className="block font-medium mb-1 mt-4 ">Kode Pendaftar</label>
                  <input
                    type="text"
                    value={formData.kode_pendaftar}   maxLength={15}
                  onChange={(e) => setFormData({ ...formData, kode_pendaftar: e.target.value })}
                    className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                  />
                </>
              )}

              </div>

          <div>
              <label className="block font-medium mb-1">Kategori Kendala</label>
            <select
              name="kategori_id"
              value={formData.kategori_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
            >
              <option value="">Pilih Kategori</option>
              {KategoriList.map(kategori => (
                <option key={kategori.id} value={kategori.id}>
                  {kategori.nama_kategori}
                </option>
              ))}
            </select>
            <label className="block font-medium mb-1 mt-4">Kendala </label>
            <input
            name="kendala"
            value={formData.kendala}
            onChange={handleChange}  // <--- tambahkan ini
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
            rows={4}
/>

          </div>
  
          <div>
            <label className="block font-medium mb-1">Nama</label>
            <input name="nama" value={formData.nama} onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring" />
          </div>
          
  
          <div>
            <label className="block font-medium mb-1">No. WA</label>
            <input name="no_wa" value={formData.no_wa} onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring" />
          </div>
          
  
          <div>
            <label className="block font-medium mb-1">Tindak Lanjut</label>
            <input name="tindak_lanjut" value={formData.tindak_lanjut} onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring" />
          </div>
  
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring">
              <option value="Progres">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
  
          
  
          <div>
            <label className="block font-medium mb-1">Tanggal Penanganan</label>
            <input type="date" name="tanggal_penanganan" value={formData.tanggal_penanganan} onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring" />
          </div>
          <div>
            <label className="block font-medium mb-1">Petugas</label>
            <select name="petugas_id" value={formData.petugas_id} onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring">
              <option value="">Pilih Petugas</option>
              {dataPetugas.map((petugas) => (
                <option key={petugas.id} value={petugas.id}>{petugas.nama_pengguna}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Tanggal Selesai</label>
            <input type="date" name="tanggal_selesai" value={formData.tanggal_selesai} onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring" />
          </div>
      
          <div className="md:col-span-2 text-right mt-4">
            <button type="button" onClick={handleUpdateKendala}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              Simpan Perubahan
            </button>
          </div>
          </form>






          {/* TAMBAH KENDALA BARU */}
<div className="md:col-span-2 mt-8 border-t pt-6">
  <label
    onClick={() => setShowTambahKendala(!showTambahKendala)}
    className="flex items-center font-semibold text-gray-700 mb-2 cursor-pointer"
  >
    {showTambahKendala ? <ChevronDown className="mr-2" /> : <ChevronRight className="mr-2" />}
    Tambah Kendala Baru ke Riwayat
  </label>
  

  {showTambahKendala && (
    <div className="bg-gray-50 border p-4 rounded-lg space-y-4 mt-4">
      <div>

              <label className="block font-medium mb-1 mt-4 text-m text-gey-700">Kategori Kendala</label>
              <select
                name=""
                value={formKendalaBaru.kategori_id}
                onChange={(e)=> setFormKendalaBaru({...formKendalaBaru, kategori_id: e.target.value})}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
              >
                <option value="">Pilih Kategori</option>
              {KategoriList.map(kategori => (
                <option key={kategori.id} value={kategori.id}>
                  {kategori.nama_kategori}
                </option>
                ))}
              </select>
              <label className="block font-medium mb-1 mt-4 text-sm text-gray-700">Deskripsi Kendala Baru</label>
              <textarea
              name="kendala"
              value={formKendalaBaru.kendala}
              onChange={(e) => setFormKendalaBaru({ ...formKendalaBaru, kendala: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                rows={3}
                placeholder="Masukan Kendala Baru"
            />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-1 text-sm text-gray-700">Tindak Lanjut</label>
          <input
            type="text"
            name="tindak_lanjut"
            value={formKendalaBaru.tindak_lanjut}
            onChange={(e) =>
              setFormKendalaBaru({ ...formKendalaBaru, tindak_lanjut: e.target.value })
            }
         
            placeholder="Masukan Tindak Lanjut"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-sm text-gray-700">Petugas</label>
          <select
            name="petugas_id"
            value={formKendalaBaru.petugas_id}
            onChange={(e) => setFormKendalaBaru({ ...formKendalaBaru, petugas_id: e.target.value })}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          >
             <option value="">Pilih Petugas</option>
            {dataPetugas.map((p) => (
              <option key={p.id} value={p.id}>{p.nama_pengguna}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1 text-sm text-gray-700">Tanggal Penanganan</label>
          <input
            type="date"
            name="tanggal_penanganan"
            value={formKendalaBaru.tanggal_penanganan}
            onChange={(e) => setFormKendalaBaru({ ...formKendalaBaru, tanggal_penanganan: e.target.value })}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-sm text-gray-700">Tanggal Selesai</label>
          <input
            type="date"
            name="tanggal_selesai"
            value={formKendalaBaru.tanggal_selesai}
            onChange={(e) => setFormKendalaBaru({ ...formKendalaBaru, tanggal_selesai: e.target.value })}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-sm text-gray-700">Status </label>
          <select
            name="status"
            value={formKendalaBaru.status}
            onChange={(e) => setFormKendalaBaru({ ...formKendalaBaru, status: e.target.value })}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring">
              <option value="Progres">Diproses</option>
              <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      <div className="text-right">
              <button
          type="button"
          onClick={handleTambahKendalaBaru}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Simpan Kendala Baru ke Daftar
        </button>

      </div>
    </div>
  )}
</div>
            

        
  
{riwayatKendala.length > 0 && (
 <div className="mt-10">
  <h3 className="text-xl font-bold mb-4 text-gray-800">
    Riwayat Kendala - {formData.nama} ({formData.kode_pendaftar})
  </h3>

  {riwayatKendala.length === 0 ? (
    <p className="text-gray-500 italic">Belum ada riwayat kendala.</p>
  ) : (<div className="grid gap-4 md:grid-cols-2">
  {riwayatKendala.map((item, idx) => (
    <div
      key={idx}
      className="bg-white border-l-4 border-yellow-400 p-5 rounded-lg shadow hover:shadow-md transition"
    >
      <p className="mb-2">
        <span className="font-medium text-gray-700">Tanggal Penanganan:</span>{' '}
        {item.tanggal_penanganan || '-'}
      </p>
      {/* <p className="mb-1">
        <span className="font-medium text-gray-700">Kategori kendala:</span>{' '}
        {item.kategori?.nama_kategori || '-'}
      </p> */}
      <p className="mb-1">
        <span className="font-medium text-gray-700">Kendala:</span>{' '}
        {item.kendala}
      </p>
      <p className="mb-1">
        <span className="font-medium text-gray-700">Tindak Lanjut:</span>{' '}
        {item.tindak_lanjut || '-'}
      </p>
      <p className="mb-1">
        <span className="font-medium text-gray-700">Petugas:</span>{' '}
        {item.petugas?.nama_pengguna || '-'}
      </p>
      <p className="mb-1">
        <span className="font-medium text-gray-700">Status:</span>{' '}
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
            item.status === 'Selesai'
              ? 'bg-green-100 text-green-700'
              : item.status === 'Diproses'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {item.status || '-'}
        </span>
      </p>
      <p>
        <span className="font-medium text-gray-700">Tanggal Selesai:</span>{' '}
        {item.tanggal_selesai || '-'}
      </p>
    </div>
  ))}
</div>
  )}
  </div>
)}
    </div>
  </Layout>
  
  );
};


export default EditKendala;
