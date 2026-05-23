import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 512, height: 512 }

export async function GET() {
  return new ImageResponse(
    <div style={{
      width: 512, height: 512,
      background: 'linear-gradient(145deg, #052e12 0%, #0f3d1e 100%)',
      borderRadius: 116,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 374, height: 374,
        background: 'white',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}>
        <div style={{
          width: 134, height: 202,
          background: '#0f3d1e',
          borderRadius: '50%',
          transform: 'rotate(-20deg)',
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ width: 36, height: 48, background: 'rgba(15,61,30,0.35)', borderRadius: '8px 8px 0 0' }} />
          <div style={{ width: 36, height: 74, background: 'rgba(15,61,30,0.65)', borderRadius: '8px 8px 0 0' }} />
          <div style={{ width: 36, height: 106, background: '#0f3d1e', borderRadius: '8px 8px 0 0' }} />
        </div>
      </div>
    </div>,
    { width: 512, height: 512 }
  )
}
