// app/interview/[id]/layout.tsx
export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="interview-layout">
      {/* Shared navbar/sidebar for interview pages, etc. */}
      {children}
    </div>
  );
}
