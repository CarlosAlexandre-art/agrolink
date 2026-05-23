import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 192, height: 192 }

export async function GET() {
  return new ImageResponse(
    <div style={{
      width: 192, height: 192,
      background: '#ede9df',
      borderRadius: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Círculo verde — tudo centralizado dentro */}
      <div style={{
        width: 138, height: 138,
        background: 'linear-gradient(145deg, #0f3d1e 0%, #1a5c2a 50%, #2d7a1f 100%)',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        {/* Folha */}
        <div style={{
          width: 38, height: 50,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '50% 8% 50% 8%',
          transform: 'rotate(-12deg)',
        }} />
        {/* Barras crescentes */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 5,
        }}>
          <div style={{ width: 10, height: 16, background: 'rgba(255,255,255,0.38)', borderRadius: '2px 2px 0 0' }} />
          <div style={{ width: 10, height: 24, background: 'rgba(255,255,255,0.60)', borderRadius: '2px 2px 0 0' }} />
          <div style={{ width: 10, height: 34, background: 'rgba(255,255,255,0.90)', borderRadius: '2px 2px 0 0' }} />
        </div>
      </div>
    </div>,
    { width: 192, height: 192 }
  )
}
