import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 512, height: 512 }

export async function GET() {
  return new ImageResponse(
    <div style={{
      width: 512, height: 512,
      background: 'linear-gradient(145deg, #0a2e12 0%, #0f3d1e 50%, #1a5c2a 100%)',
      borderRadius: 116,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 26,
    }}>
      {/* Folha grande — elemento principal */}
      <div style={{
        width: 202, height: 276,
        background: 'white',
        borderRadius: '50% 6% 50% 6%',
        transform: 'rotate(-15deg)',
      }} />
      {/* Barras crescentes */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 20,
      }}>
        <div style={{ width: 42, height: 58, background: 'rgba(255,255,255,0.35)', borderRadius: '10px 10px 0 0' }} />
        <div style={{ width: 42, height: 90, background: 'rgba(255,255,255,0.60)', borderRadius: '10px 10px 0 0' }} />
        <div style={{ width: 42, height: 128, background: 'rgba(255,255,255,0.92)', borderRadius: '10px 10px 0 0' }} />
      </div>
    </div>,
    { width: 512, height: 512 }
  )
}
