import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminLoginPage } from "../admin/AdminLoginPage";
import { AdminProjectsPage } from "../admin/AdminProjectsPage";
import { ADMIN_LOGIN_ROUTE, ADMIN_PROJECTS_ROUTE } from "../config/admin";
import App from "./App";
import "../styles/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path={ADMIN_LOGIN_ROUTE} element={<AdminLoginPage />} />
        <Route path={ADMIN_PROJECTS_ROUTE} element={<AdminProjectsPage />} />
        <Route path="/" element={<App />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
