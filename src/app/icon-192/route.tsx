import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    <div style={{
      width: 192, height: 192,
      background: '#dad6ca',
      borderRadius: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        width: 148, height: 148,
        borderRadius: '50%',
        border: '7px solid #104e27',
        display: 'flex',
      }} />
      <div style={{
        position: 'absolute',
        left: 22, top: 28,
        width: 56, height: 90,
        background: 'linear-gradient(135deg, #104e27, #679d3f)',
        borderRadius: '50% 10% 50% 10%',
        transform: 'rotate(-15deg)',
        display: 'flex',
      }} />
      <div style={{ position: 'absolute', right: 28, bottom: 32, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <div style={{ width: 12, height: 24, background: '#104e27', borderRadius: 3 }} />
        <div style={{ width: 12, height: 36, background: '#104e27', borderRadius: 3 }} />
        <div style={{ width: 12, height: 50, background: '#679d3f', borderRadius: 3 }} />
      </div>
      <div style={{
        position: 'absolute', right: 30, top: 42,
        fontSize: 18, fontWeight: 900,
        color: '#104e27', fontFamily: 'sans-serif',
        display: 'flex',
      }}>R$</div>
    </div>,
    {
      width: 192,
      height: 192,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    }
  )
}
