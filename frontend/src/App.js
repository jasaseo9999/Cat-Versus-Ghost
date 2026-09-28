import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import MainMenu from "@/pages/MainMenu";
import LevelSelect from "@/pages/LevelSelect";
import GamePage from "@/pages/GamePage";
import Almanac from "@/pages/Almanac";
import Leaderboard from "@/pages/Leaderboard";
import Upgrades from "@/pages/Upgrades";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/levels" element={<LevelSelect />} />
          <Route path="/play/:levelId" element={<GamePage mode="story" />} />
          <Route path="/endless" element={<GamePage mode="endless" />} />
          <Route path="/almanac" element={<Almanac />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/upgrades" element={<Upgrades />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
