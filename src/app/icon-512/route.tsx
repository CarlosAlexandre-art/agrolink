import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 512, height: 512 }

export async function GET() {
  return new ImageResponse(
    <div style={{
      width: 512, height: 512,
      background: '#ede9df',
      borderRadius: 116,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Círculo verde — tudo centralizado dentro */}
      <div style={{
        width: 370, height: 370,
        background: 'linear-gradient(145deg, #0f3d1e 0%, #1a5c2a 50%, #2d7a1f 100%)',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}>
        {/* Folha */}
        <div style={{
          width: 100, height: 134,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '50% 8% 50% 8%',
          transform: 'rotate(-12deg)',
        }} />
        {/* Barras crescentes */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 14,
        }}>
          <div style={{ width: 28, height: 44, background: 'rgba(255,255,255,0.38)', borderRadius: '5px 5px 0 0' }} />
          <div style={{ width: 28, height: 64, background: 'rgba(255,255,255,0.60)', borderRadius: '5px 5px 0 0' }} />
          <div style={{ width: 28, height: 90, background: 'rgba(255,255,255,0.90)', borderRadius: '5px 5px 0 0' }} />
        </div>
      </div>
    </div>,
    { width: 512, height: 512 }
  )
}
