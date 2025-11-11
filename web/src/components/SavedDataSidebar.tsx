import type { PortfolioState } from "../state/Portfolio.types";

interface SavedDataSidebarProps {
  portfolio: PortfolioState;
  sidebarOpen: boolean;
  onToggle: () => void;
}

export default function SavedDataSidebar({ 
  portfolio, 
  sidebarOpen 
}: SavedDataSidebarProps) {
  return (
    <aside className={"saved-state" + (sidebarOpen ? "" : " closed")}>
      <h2>Saved data</h2>
      <pre>{JSON.stringify({ portfolio }, null, 2)}</pre>
    </aside>
  );
}