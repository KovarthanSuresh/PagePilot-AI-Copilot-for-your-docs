// frontend/app/learn/layout.tsx
export default function LearnLayout({ children }: { children: React.ReactNode }) {
    // This ensures your page.tsx under /learn actually renders
    return <>{children}</>;
  }
  