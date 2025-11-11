import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function SkeletonProvider({ children }: { children: React.ReactNode }) {
  return (
    <SkeletonTheme 
      baseColor="#374151" 
      highlightColor="#4b5563"
      duration={1.5}
    >
      {children}
    </SkeletonTheme>
  );
}