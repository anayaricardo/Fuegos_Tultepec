import { useState } from "react";
import "./App.css";
import Fireworks from "./components/Fireworks";

function App() {
  return (
    <>
      <h1 style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <span className="rotulo-main">Fuegos Artificiales</span>
        <br />
        <span className="mexico-colors">DE TULTEPEC</span>
        <span style={{ color: "white" }}> 🎆</span>
      </h1>
      <Fireworks />
    </>
  );
}

export default App;
