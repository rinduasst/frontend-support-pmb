import React from 'react';
import { Routes, Route } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// <ToastContainer />


import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DaftarKendala from './pages/DaftarKendala';
import Pengguna from './pages/Pengguna';
import TambahKendala from './pages/TambahKendala';
import EditKendala from './pages/EditKendala';
import TambahPengguna from './pages/TambahPengguna';
import EditPengguna from './pages/EditPengguna';
import Login from './pages/Login';
import UbahPassword from './pages/UbahPassword';
import KategoriKendala from './pages/KategoriKendala';
import TambahKategoriKendala from './pages/TambahKategoriKendala';
import UbahKategoriKendala from './pages/UbahKategoriKendala';


const App = () => {
  return (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kendala" element={<DaftarKendala />} />
            <Route path="/pengguna" element={<Pengguna />} />
            <Route path="/kendala/tambah" element={<TambahKendala />} />
            <Route path="/kendala/edit/:id" element={<EditKendala />} />
            <Route path="/pengguna/tambah" element={<TambahPengguna />} />
            <Route path="/pengguna/edit/:id" element={<EditPengguna/>}/>
            <Route path="/login" element={<Login />} />
            <Route path="/pengguna/ubah-password/:id" element={<UbahPassword />} />
            <Route path="/kategori-kendala" element={<KategoriKendala />} />
            <Route path="/kategori-kendala/tambah" element={<TambahKategoriKendala />} />
            <Route path="/kategori-kendala/edit/:id" element={<UbahKategoriKendala />} />
            </Routes>
  );
};




export default App;
