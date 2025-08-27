interface SavedItemProps {
  savedName: string;
}

export function SavedItem({ savedName }: SavedItemProps) {
  return (
    <div className="saved-item" 

    >
    {savedName}
    </div>
  );
}
