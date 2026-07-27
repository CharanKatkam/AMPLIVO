'use client';
export const dynamic = 'force-dynamic';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong!</h2>
          <button onClick={() => reset()} style={{ padding: '8px 16px', background: '#4C1D95', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
