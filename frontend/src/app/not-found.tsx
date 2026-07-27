import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/" style={{ marginTop: '16px', color: '#4C1D95', textDecoration: 'underline' }}>
        Return Home
      </Link>
    </div>
  );
}
