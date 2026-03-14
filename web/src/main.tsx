import React from "react";
import { createRoot } from "react-dom/client";
import { QuizApp } from "./quiz/QuizApp";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QuizApp />
  </React.StrictMode>
);
