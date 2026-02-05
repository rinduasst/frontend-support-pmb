import React, { useEffect, useState, useRef } from 'react';
import api from '../api'; 
import Layout from '../components/Layout';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/solid';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FaTimes } from "react-icons/fa";

const DaftarKendala = () => {
  const [kendala, setKendala] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [petugasList, setPetugasList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const location = useLocation();
  const activePageRef = useRef(null);
  const navigate= useNavigate();
  const [importProgres, setImportProgres] = useState(0); // nilai 0–100
  const [importStatusText, setImportStatusText] = useState(''); // teks deskripsi progres
  const [showExportOptions, setShowExportOptions] = useState(false); //pilihan format ekspor

const logoRef = useRef(null);
  useEffect(() => {
    fetchKendala();
    fetchPetugas();

    if (location.state?.updated) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchKendala = async () => {
    try {
      const response = await api.get("/kendala");
       // Urutkan dari yang terbaru ke lama (berdasarkan ID atau tanggal)
    const sorted = response.data.sort((a, b) => {
      return new Date(b.id) - new Date(a.id); // Berdasarkan tanggal penanganan
      // return b.id - a.id; // ASCENDING → FIFO // DESCENDING → LIFO
    });

      setKendala(sorted);
    } catch (error) {
      console.error('Ada error:', error);
    } finally {
      setLoading(false);
    }
  };
  // const fetchKendala = async (page = 1) => {
  //   try {
  //     const response = await api.get(`/kendala?page=${page}`);
  
  //     // Ambil data dari response.data.data (bukan response.data langsung)
  //     const data = response.data.data;
  
  //     // Urutkan dari terbaru
  //     const sorted = data.sort((a, b) => b.id - a.id);
  
  //     setKendala(sorted);
  //     setCurrentPage(response.data.current_page); // simpan page sekarang
  //   } catch (error) {
  //     console.error('Ada error:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  

  const fetchPetugas = async () => {
    try {
      const response = await api.get('/petugas');
      setPetugasList(response.data);
    } catch (error) {
      console.error("Gagal ambil data petugas:", error);
    }
  };
  

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const response = await api.get('/kategori-kendala');
        setKategoriList(response.data);
      } catch (error) {
        console.error("Gagal mengambil data kategori:", error);
      }
    };
  
    fetchKategori();
  }, []);
  
  const getPetugasIdByName = (name) => {
    if (typeof name !== 'string') return null;
    const petugas = petugasList.find(p =>
      typeof p.nama_pengguna === 'string' &&
      p.nama_pengguna.toLowerCase() === name.toLowerCase()
    );
    return petugas ? petugas.id : null;
  };

  const convertDate = (excelDate) => {
    if (!excelDate) return '';
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().slice(0, 10);
    }
    const parsed = new Date(excelDate);
    return isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        for (let index = 0; index < json.length; index++) {
          const row = json[index];
          const kodePendaftar = row['Kode Pendaftar'];
          const isPendaftar = kodePendaftar && kodePendaftar !== '-';
          const safeString = (val) =>
          val === undefined || val === null ? '' : String(val).trim();
        
        try {
          await api.post("/kendala" , {
            status_pendaftar: isPendaftar ? 'pendaftar' : 'peminat',
            kode_pendaftar: isPendaftar ? safeString(kodePendaftar) : null,
            nama: safeString(row['Nama']),
            kendala: safeString(row['Kendala']),
            tindak_lanjut: safeString(row['Tindak Lanjut']),
            no_wa: safeString(row['No WA']),
            status: safeString(row['Status']) || 'Progres',
            tanggal_penanganan: convertDate(row['Tanggal Penanganan']),
            tanggal_selesai: convertDate(row['Tanggal Selesai']),
            petugas_id: getPetugasIdByName(row['Petugas']),
          });
        } catch (error) {
          const errorData = error.response?.data;
          let msg = `Gagal simpan data di baris ${index + 2}`;
          if (errorData && errorData.errors) {
            const messages = Object.values(errorData.errors).flat();
            if (messages.length > 0) {
              msg += `: ${messages[0]}`;
            }
          }
          console.error(msg, errorData || error);
          alert(msg);
        }
        
        const percent = Math.round(((index + 1) / json.length) * 100);
        setImportProgres(percent);
        setImportStatusText(`Mengunggah data ke-${index + 1} dari ${json.length}...`);
      
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
        await fetchKendala();
        alert('Import selesai!');
      } catch (error) {
        console.error('Gagal memproses file:', error);
        alert('Terjadi kesalahan saat membaca file Excel.');
      } finally {
        setShowImportModal(false);
        setImporting(false);
        setImportFile(null);
      }
    };
    reader.readAsArrayBuffer(importFile);
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  const [filterStatusPendaftar, setFilterStatusPendaftar] = useState('');
  const [filterStatusProses, setFilterStatusProses] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterKategori,setFilterKategori]=useState('');
  const normalizeStatus = (status) => {
    if (!status) return '';
    const normalized = status.toLowerCase();
    return normalized === 'diproses' ? 'Progres' : status;
  };
  
  const filteredKendala = kendala.filter(item => {
    const searchMatch =
    (item.kode_pendaftar || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.kendala || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.no_wa || '').toLowerCase().includes(searchTerm.toLowerCase());  
      // item.filterKategori?.toLowerCase().includes(searchTerm.toLowerCase())
  
    const statusPendaftarMatch = filterStatusPendaftar === '' || item.status_pendaftar === filterStatusPendaftar;
    const statusProsesMatch = filterStatusProses === '' || normalizeStatus(item.status) === filterStatusProses;
    const kategoriMatch = filterKategori === '' || item.kategori_id === parseInt(filterKategori);
    const tanggal = new Date(item.tanggal_penanganan);
    let bulanMatch = true;
    let tahunMatch = true;
    
    if (filterBulan || filterTahun) {
      if (item.tanggal_penanganan) {
        const tanggal = new Date(item.tanggal_penanganan);
        if (!isNaN(tanggal)) {
          bulanMatch = filterBulan === '' || tanggal.getMonth() + 1 === parseInt(filterBulan);
          tahunMatch = filterTahun === '' || tanggal.getFullYear() === parseInt(filterTahun);
        } else {
          bulanMatch = false;
          tahunMatch = false;
        }
      } else {
        bulanMatch = false;
        tahunMatch = false;
      }
    }
    
    return searchMatch && statusPendaftarMatch && statusProsesMatch && kategoriMatch&& bulanMatch && tahunMatch;
  }); 


  const totalPages = Math.ceil(filteredKendala.length / itemsPerPage);
  const paginatedKendala = filteredKendala.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handleExportPDF = () => {
    const img = logoRef.current;
  
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  
    const logoBase64 = canvas.toDataURL('image/png');
  
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const currentDate = new Date();
    const monthYear = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const dateToday = currentDate.toLocaleDateString('id-ID');
    const year = currentDate.getFullYear();
  
  
    doc.addImage(logoBase64, 'PNG', 10, 8, 25, 25);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("LAPORAN PENANGANAN KENDALA PMB", pageWidth / 2, 15, { align: "center" });
  
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(
      "Tim Validasi dan Pengolah Data\nLayanan Informasi Digital dan Penanganan Kendala Sistem",
      pageWidth / 2, 22,
      { align: "center" }
    );
  
    doc.line(10, 33, pageWidth - 10, 33);
    doc.setFontSize(9);
    doc.text(`Tanggal Cetak: ${dateToday}`, pageWidth - 10, 10, { align: "right" });
  
    const tableData = filteredKendala.map((item, index) => [
      index + 1,
      item.status_pendaftar || '-',
      item.kode_pendaftar || '-',
      item.nama || '-',
      item.kendala || '-',
      item.tindak_lanjut || '-',
      item.no_wa || '-',
      item.status || '-',
      item.tanggal_penanganan || '-',
      item.tanggal_selesai || '-',
      item.petugas?.nama_pengguna || '-'
    ]);
  
    autoTable(doc, {
      startY: 40,
      head: [[
        "No", "Status Pendaftar", "Kode Pendaftar", "Nama", "Kendala", "Tindak Lanjut",
        "No WA", "Status", "Tanggal   Penanganan", "Tanggal Selesai", "Petugas"
      ]],
      body: tableData,
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 }, 
        1: { cellWidth: 20 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 30 },
        7: { cellWidth: 15 },
        8: { cellWidth: 'auto' },
        9: { cellWidth: 20 },
        10: { cellWidth: 20 } 
      }
      
    });
  
    // doc.save(`Laporan_PMB_${monthYear.replace(/\s/g, "_")}.pdf`);
    doc.save(`Laporan_PMB_${year}.pdf`);
  };

  const handleExport = async () => {
    const currentDate = new Date();
    const monthYear = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Daftar Kendala');
  
    // Judul
    worksheet.mergeCells('A1:K1');
    worksheet.getCell('A1').value = 'Laporan PMB';
    worksheet.getCell('A1').font = { size: 14, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
    worksheet.mergeCells('A2:K2');
    worksheet.getCell('A2').value = 'Tim Validasi dan Pengolah Data - Layanan Informasi Digital dan Penanganan Kendala Sistem';
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
  
    worksheet.mergeCells('A3:K3');
    worksheet.getCell('A3').value = `Periode: ${monthYear}`;
    worksheet.getCell('A3').alignment = { horizontal: 'center' };
  
    // Header
    const header = [
      "No", "Status Pendaftar", "Kode Pendaftar", "Nama", "Kendala", "Tindak Lanjut",
      "No WA", "Status", "Tanggal Penanganan", "Tanggal Selesai", "Petugas"
    ];
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(header);
  
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCE5FF' }, // Biru muda
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  
    // Data
    filteredKendala.forEach((item, index) => {
      worksheet.addRow([
        index + 1,
        item.status_pendaftar || '-',
        item.kode_pendaftar || '-',
        item.nama || '-',
        item.kendala || '-',
        item.tindak_lanjut || '-',
        item.no_wa || '-',
        item.status || '-',
        item.tanggal_penanganan || '-',
        item.tanggal_selesai || '-',
        item.petugas?.nama_pengguna || '-',
      ]);
    });
  
    // Lebar kolom otomatis
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Status Pendaftar', key: 'status_pendaftar', width: 20 },
      { header: 'Kode Pendaftar', key: 'kode_pendaftar', width: 20 },
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'Kendala', key: 'kendala', width: 30 },
      { header: 'Tindak Lanjut', key: 'tindak_lanjut', width: 30 },
      { header: 'No WA', key: 'no_wa', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Tanggal Penanganan', key: 'tanggal_penanganan', width: 20 },
      { header: 'Tanggal Selesai', key: 'tanggal_selesai', width: 20 },
      { header: 'Petugas', key: 'petugas', width: 20 },
    ];
    
   
  
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Laporan_PMB_${currentDate.getFullYear()}.xlsx`);
  };
  
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Yakin ingin menghapus data ini?');
    if (confirmDelete) {
      try {
        await api.delete(`/kendala/${id}`);
        setKendala(kendala.filter(item => item.id !== id));
        alert('Data berhasil dihapus');
      } catch (error) {
        console.error('Gagal menghapus data:', error);
        alert('Gagal menghapus data');
      }
    }
  };

  const getStatusBadge = (status) => {
      const normalized = normalizeStatus(status);
      if (normalized === 'Progres') {
      return <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">Progres</span>;
    }
    if (status === 'Selesai') {
      return <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">Selesai</span>;
    }
    return status;
  };
  useEffect(() => {
    if (activePageRef.current) {
      activePageRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentPage]);
  
  
  return (
    <Layout>
      <img ref={logoRef} src="/logouika.png" alt="Logo UIKA" style={{ display: 'none' }} crossOrigin="anonymous" />
      <div className="space-y-6">
  {/* HEADER DAN TOMBOL AKSI */}
  <div className="bg-white rounded-lg shadow-md p-4 pb-2 max-w-full max-h-[600px] overflow-y-auto">


        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Daftar Kendala</h2>
          <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-purple-500 hover:bg-purple-700 text-white text-sm px-4 py-3 rounded-lg transition"
              >
                Import Excel
              </button>
              <div className="relative">
          <button
            onClick={() => setShowExportOptions(true)}
            className="bg-blue-600 text-white text-sm px-4 py-3 rounded-lg transition hover:bg-blue-700"
          >
            Export File 
          </button>

          {showExportOptions && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
              {/* Tombol X di pojok kanan atas */}
              <button
                onClick={() => {
                  setShowExportOptions(false);
                  navigate('/kendala');
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={18} />
              </button>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Pilih Format File:</h3>

                <div className="space-y-2">
                <button
          className="block w-full text-left px-4 py-2 rounded hover:bg-blue-100"
          onClick={() => {
            handleExport(); // jalankan export excel
            setShowExportOptions(false); // popup langsung hilang
          }}
        >
          Excel (.xlsx)
        </button>

        <button
          className="block w-full text-left px-4 py-2 rounded hover:bg-blue-100"
          onClick={() => {
            handleExportPDF(); // jalankan export pdf
            setShowExportOptions(false); // popup langsung hilang
          }}
        >
          PDF (.pdf)
        </button>

      </div>
        {/* Tombol Batal */}
       
      </div>
    </div>
  )}
</div>
              <Link to="/kendala/tambah">
                <button className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-3 rounded-lg transition">
                  Tambah Kendala
                </button>
              </Link>
            </div>
          </div>
          <div className="flex flex-nowrap gap-3 mb-4 overflow-x-auto">
        <input
          type="text"
          placeholder="Cari..."
          className="w-[180px] px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filterStatusPendaftar}
          onChange={(e) => setFilterStatusPendaftar(e.target.value)}
          className="w-full sm:w-[200px] px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-blue-400"
        >
          <option value="">Pilih Status Pendaftar</option>
          <option value="pendaftar">Pendaftar</option>
          <option value="peminat">Peminat</option>
        </select>
        <select
        value={filterKategori}
        onChange={(e) => setFilterKategori(e.target.value)}
        className="w-full sm:w-[200px] px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-blue-400"
      >
        <option value="">Pilih Kategori kendala</option>
        {kategoriList.map((kategori) => (
          <option key={kategori.id} value={kategori.id}>
            {kategori.nama_kategori}
          </option>
        ))}
      </select>


        <select
          value={filterStatusProses}
          onChange={(e) => setFilterStatusProses(e.target.value)}
          className="w-[180px] px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-blue-400"
        >
          <option value="">Pilih Status</option>
          <option value="Progres">Diproses</option>
          <option value="Selesai">Selesai</option>
        </select>

        <select
          value={filterBulan}
          onChange={(e) => setFilterBulan(e.target.value)}
          className="w-[180px] px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-blue-400"
        >
          <option value="">Pilih Bulan</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
            </option>
          ))}
        </select>

        <select
          value={filterTahun}
          onChange={(e) => setFilterTahun(e.target.value)}
          className="w-[180px] px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-blue-400"
        >
          <option value="">Pilih Tahun</option>
          {[2023, 2024, 2025, 2026].map((tahun) => (
            <option key={tahun} value={tahun}>
              {tahun}
            </option>
          ))}
        </select>
      </div>

  
          {loading ? (
            <div className="text-center py-10 text-gray-500">Memuat data...</div>
          ) : (
            <div className="">
     <div className="overflow-y-auto max-h-[600px] rounded border">
  <table className="w-full divide-y divide-gray-200 text-xs">
    <thead className="bg-gray-100 sticky top-0 z-10">
      <tr>
        <th className="px-2 py-1">No</th>
        <th className="px-2 py-1">Status Pendaftar</th>
        <th className="px-2 py-1">Kode</th>
        <th className="px-2 py-1">Kategori</th>
        <th className="px-2 py-1">Nama</th>
        <th className="px-2 py-1">Kendala</th>
        <th className="px-2 py-1">Tindak Lanjut</th>
        <th className="px-2 py-1">No WA</th>
        <th className="px-2 py-1">Status</th>
        <th className="px-2 py-1">Penanganan</th>
        <th className="px-2 py-1">Selesai</th>
        <th className="px-2 py-1">Petugas</th>
        <th className="px-2 py-1">Aksi</th>
      </tr>
    </thead>
    <tbody className="text-gray-800">
      {paginatedKendala.map((item, idx) => (
        <tr key={item.id} className="border-t">
          <td className="px-2 py-1 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
          <td className="px-2 py-1 capitalize">{item.status_pendaftar}</td>
          <td className="px-2 py-1 capitalize">{item.kode_pendaftar}</td>
          <td className="px-2 py-1 capitalize">{item.kategori?.nama_kategori}</td>
          <td className="px-2 py-1 capitalize">{item.nama}</td>
          <td className="px-4 py-2 text-sm text-gray-700 break-words max-w-xs"> {item.kendala}</td>
          <td className="px-4 py-2 text-sm text-gray-700 break-words max-w-xs"> {item.tindak_lanjut}</td>
          <td className="px-2 py-1">{item.no_wa}</td>
          <td className="px-2 py-1">
            {item.status === 'Selesai' ? (
              <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                Selesai
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                Diproses
              </span>
            )}
          </td>
          <td className="px-2 py-1">{item.tanggal_penanganan}</td>
          <td className="px-2 py-1">{item.tanggal_selesai}</td>
          <td className="px-2 py-1 text-center">
            {item.petugas?.nama_pengguna ? (
              <div className="bg-gray-200 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px]">
                <UserIcon className="w-3 h-3 mr-1 text-gray-700" />
                {item.petugas.nama_pengguna}
              </div>
            ) : (
              <span className="italic text-gray-400">Tidak Ada</span>
            )}
          </td>
          <td className="px-2 py-1 flex gap-1 justify-center">
            <Link to={`/kendala/edit/${item.id}`}>
              <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-1.5 rounded-full">
                <PencilIcon className="h-3 w-3" />
              </button>
            </Link>
            <button
              onClick={() => handleDelete(item.id)}
              className="bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded-full"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

         
            </div>
          )}
        </div>
        {/* Pagination */}
              <div className="flex justify-center items-center mt-1 space-x-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-gray-200 rounded text-xs disabled:opacity-50"
          >
            Sebelumnya
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const isActive = currentPage === i + 1;
            return (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                ref={isActive ? activePageRef : null}
                className={`px-2 py-1 rounded text-xs ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-gray-200 rounded text-xs disabled:opacity-50"
          >
            Selanjutnya
          </button>
        </div>

      </div>
  
      {/* Modal Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Upload File Excel Kendala</h3>
            <form className="space-y-4">
            <div className="text-center">
            <a
              href="/template_kendala.xlsx"
              download
              className="inline-flex items-center justify-center bg-blue-500 text-white px-6 py-3 text-sm font-semibold rounded-lg shadow hover:bg-blue-600 transition"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16V4H4zm4 10l4 4 4-4M12 14V8" />
              </svg>
              Download Template Excel
            </a>
          </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih File Excel</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                {importFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    File dipilih: <strong>{importFile.name}</strong>
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setImportFile(null);
                    setShowImportModal(false);
                  
                  }}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm"
                >
                  Batal 
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  className={`px-4 py-2 rounded text-sm text-white ${
                    !importFile || importing
                      ? 'bg-green-300 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {importing ? 'Mengunggah...' : 'Upload'}
                </button>
                    </div>
             {importing && (
              <div className="mt-4 w-full">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-200"
                    style={{ width: `${importProgres}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 text-center">{importStatusText}</p>
              </div>
            )}
            
             
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
  
                  };

export default DaftarKendala;
