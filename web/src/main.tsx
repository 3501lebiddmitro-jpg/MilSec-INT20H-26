import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QuizApp } from "./quiz/QuizApp";
import AdminPanel from "./admin/AdminPanel";
import AdminSimple from "./admin/AdminSimple";
import { FlowProvider } from "./admin/FlowContext";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Головна сторінка — це наш квиз */}
        <Route path="/" element={<QuizApp />} />
        
        {/* Повна візуальна адмінка */}
        <Route path="/admin" element={
          <FlowProvider>
            <AdminPanel />
          </FlowProvider>
        } />

        {/* Спрощена адмінка-список */}
        <Route path="/admin-simple" element={
          <FlowProvider>
            <AdminSimple />
          </FlowProvider>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
