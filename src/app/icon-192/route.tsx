import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 192, height: 192 }

export async function GET() {
  return new ImageResponse(
    <div style={{
      width: 192, height: 192,
      background: 'linear-gradient(145deg, #0a2e12 0%, #0f3d1e 50%, #1a5c2a 100%)',
      borderRadius: 44,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    }}>
      {/* Folha grande — elemento principal */}
      <div style={{
        width: 76, height: 104,
        background: 'white',
        borderRadius: '50% 6% 50% 6%',
        transform: 'rotate(-15deg)',
      }} />
      {/* Barras crescentes — mais largas e visíveis */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
      }}>
        <div style={{ width: 16, height: 22, background: 'rgba(255,255,255,0.35)', borderRadius: '4px 4px 0 0' }} />
        <div style={{ width: 16, height: 34, background: 'rgba(255,255,255,0.60)', borderRadius: '4px 4px 0 0' }} />
        <div style={{ width: 16, height: 48, background: 'rgba(255,255,255,0.92)', borderRadius: '4px 4px 0 0' }} />
      </div>
    </div>,
    { width: 192, height: 192 }
  )
}
