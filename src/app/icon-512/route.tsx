import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    <div style={{
      width: 512, height: 512,
      background: '#dad6ca',
      borderRadius: 110,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        width: 390, height: 390,
        borderRadius: '50%',
        border: '18px solid #104e27',
        display: 'flex',
      }} />
      <div style={{
        position: 'absolute',
        left: 56, top: 72,
        width: 148, height: 240,
        background: 'linear-gradient(135deg, #104e27, #679d3f)',
        borderRadius: '50% 10% 50% 10%',
        transform: 'rotate(-15deg)',
        display: 'flex',
      }} />
      <div style={{ position: 'absolute', right: 72, bottom: 86, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <div style={{ width: 30, height: 65, background: '#104e27', borderRadius: 6, opacity: 0.9 }} />
        <div style={{ width: 30, height: 98, background: '#104e27', borderRadius: 6 }} />
        <div style={{ width: 30, height: 133, background: '#679d3f', borderRadius: 6 }} />
      </div>
      <div style={{
        position: 'absolute', right: 78, top: 140,
        fontSize: 36, color: '#679d3f', fontWeight: 900,
        fontFamily: 'sans-serif', display: 'flex',
      }}>↑</div>
      <div style={{
        position: 'absolute', right: 82, top: 180,
        fontSize: 46, fontWeight: 900,
        color: '#104e27', fontFamily: 'sans-serif',
        display: 'flex',
      }}>R$</div>
    </div>,
    {
      width: 512,
      height: 512,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    }
  )
}
