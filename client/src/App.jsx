import { useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import './App.css'
import Home from '@/pages/Home';
import Register from '@/pages/auth/Register';
import Login from '@/pages/auth/Login';
// import PasswordReset from '@/pages/auth/PasswordReset';
import Dashboard from './pages/dashboard/Dashboard';
import Layout from '@/pages/Layout';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/components/auth/Unauthorized';
import RequireAuth from '@/components/auth/RequireAuth';
import PersistLogin from '@/components/auth/PersistLogin'; 
import { route } from '@/routes'
import TestPage from './pages/dashboard/TestPage';
import VerifyEmail from '@/pages/auth/VerifyEmail';

const ROLES = {
  admin: 'level3',
  enterprise: 'level2',
  individual: 'level1' 
}

function App() {

  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        {/* public routes */}
        <Route path={ route('home') } element={<Home />} />
        <Route path={ route('register') } element={<Register />} />
        <Route path="/verify-email/:username/:token" element={<VerifyEmail />} />
        <Route path={ route('login') } element={<Login />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* we want to protect these routes */}
        <Route element={<PersistLogin />}>

          <Route path='test' element={<TestPage />} />

          <Route element={<RequireAuth allowedRoles={['level3', 'level2', 'level1']} />}>
            <Route path={ route('dashboard') } element={<Dashboard />} />
          </Route>
{/* 
          <Route element={<RequireAuth allowedRoles={[ROLES.individual]} />}>
            <Route path="/" element={<Home />} />
          </Route> */}

          <Route element={<RequireAuth allowedRoles={[ROLES.individual]} />}>
            {/* <Route path="editor" element={<Editor />} /> */}
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.enterprise]} />}>
            {/* <Route path="editor" element={<Editor />} /> */}
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.admin]} />}>
            {/* <Route path="admin" element={<Admin />} /> */}
          </Route>

          {/* <Route element={<RequireAuth allowedRoles={[ROLES.Editor, ROLES.Admin]} />}>
            <Route path="lounge" element={<Lounge />} />
          </Route> */}
        </Route>

        {/* catch all */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
