import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 192, height: 192 }

export async function GET() {
  return new ImageResponse(
    <div style={{
      width: 192, height: 192,
      background: 'linear-gradient(145deg, #052e12 0%, #0f3d1e 100%)',
      borderRadius: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 140, height: 140,
        background: 'white',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 50, height: 76,
          background: '#0f3d1e',
          borderRadius: '50%',
          transform: 'rotate(-20deg)',
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ width: 14, height: 18, background: 'rgba(15,61,30,0.35)', borderRadius: '3px 3px 0 0' }} />
          <div style={{ width: 14, height: 28, background: 'rgba(15,61,30,0.65)', borderRadius: '3px 3px 0 0' }} />
          <div style={{ width: 14, height: 40, background: '#0f3d1e', borderRadius: '3px 3px 0 0' }} />
        </div>
      </div>
    </div>,
    { width: 192, height: 192 }
  )
}
