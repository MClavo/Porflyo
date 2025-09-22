import { useState } from "react";
import EditorContainer from "./EditorTestContainer";
import SavedDataSidebar from "../components/SavedDataSidebar";
import type { PortfolioState } from "../state/Portfolio.types";

// Wrapper that uses the global SavedCardsProvider and includes the SavedDataSidebar
export default function EditorTest() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1 }}>
        <EditorContainer 
          onPortfolioChange={setPortfolio}
          showSidebarToggle={true}
          onSidebarToggle={() => setSidebarOpen(s => !s)}
          sidebarOpen={sidebarOpen}
        />
      </div>
      
      {portfolio && (
        <SavedDataSidebar
          portfolio={portfolio}
          sidebarOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(s => !s)}
        />
      )}
    </div>
  );
}
