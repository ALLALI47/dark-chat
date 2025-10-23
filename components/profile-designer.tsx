"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type Preset = {
  name: string
  skin: string
  hair: string
  outfit: string
  background: string
  hairStyle?: string
  outfitStyle?: string
  glasses?: string | null
  highlights?: string | null
  hat?: string | null
}

function AvatarPreview({ skin, hair, outfit, background, hairStyle, outfitStyle, glasses, highlights, hat, glassesColor, glassesSize }: { skin: string; hair: string; outfit: string; background?: string; hairStyle?: string; outfitStyle?: string; glasses?: string | null; highlights?: string | null; hat?: string | null; glassesColor?: string; glassesSize?: number }) {
  const hairSvg = (style: string | undefined, hairCol: string) => {
    switch (style) {
      case 'spiky':
        return `<path d='M26 40c6-14 10-22 34-22s24 8 34 22c0 0-12-20-34-20S36 40 26 40z' fill='${hairCol}' />`
      case 'bob':
        return `<path d='M30 38c6-14 20-22 30-22s24 8 30 22c0 0-8-18-30-18S38 38 30 38z' fill='${hairCol}' />`
      default:
        return `<path d='M30 40c6-18 24-26 30-26s24 8 30 26c0 0-10-18-30-18S40 40 30 40z' fill='${hairCol}' />`
    }
  }

  const outfitSvg = (style: string | undefined, color: string) => {
    switch (style) {
      case 'hoodie':
        return `<rect x='14' y='78' width='92' height='50' rx='12' fill='${color}' /><path d='M60 78v-6' stroke='rgba(0,0,0,0.08)' stroke-width='3' />`
      case 'jacket':
        return `<rect x='18' y='82' width='84' height='40' rx='8' fill='${color}' /><path d='M40 92h40' stroke='rgba(255,255,255,0.06)' stroke-width='2' />`
      default:
        return `<rect x='18' y='84' width='84' height='44' rx='8' fill='${color}' />`
    }
  }

  const glassesSvg = (type: string | undefined, glassColor: string | undefined, size = 1) => {
    if (!type) return ''
    switch (type) {
      case 'round':
        return `<g transform='translate(60 ${46 - (6 * (size - 1))}) scale(${size}) translate(-60 ${-(46 - (6 * (size - 1)))})' stroke='${glassColor}' stroke-width='2' fill='none'><circle cx='50' cy='46' r='6'/><circle cx='70' cy='46' r='6'/><path d='M56 46h8' stroke='${glassColor}' stroke-width='1.5'/></g>`
      case 'square':
        return `<g transform='translate(60 ${46 - (6 * (size - 1))}) scale(${size}) translate(-60 ${-(46 - (6 * (size - 1)))})' stroke='${glassColor}' stroke-width='2' fill='none'><rect x='44' y='40' width='12' height='12' rx='2'/><rect x='64' y='40' width='12' height='12' rx='2'/><path d='M56 46h8' stroke='${glassColor}' stroke-width='1.5'/></g>`
      default:
        return ''
    }
  }

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 140' width='240' height='280'>
      <rect width='120' height='140' rx='12' fill='${background || "transparent"}' />
      ${outfitSvg(outfitStyle, outfit)}
      <rect x='52' y='66' width='16' height='10' rx='3' fill='${skin}' />
      <circle cx='60' cy='46' r='28' fill='${skin}' />
      ${hairSvg(hairStyle, hair)}
      <circle cx='50' cy='46' r='3' fill='#111827' />
      <circle cx='70' cy='46' r='3' fill='#111827' />
  ${glassesSvg(glasses || undefined, glassesColor || '#111827', glassesSize)}
  ${highlights ? `<path d='M48 28c6-6 20-6 28 0' fill='${highlights}' opacity='0.35' />` : ''}
  ${hat === 'beanie' ? `<path d='M22 28c10-14 76-14 86 0v8c0 0-14-18-43-18S35 36 22 36z' fill='${hat === 'beanie' ? '#222' : ''}' />` : ''}
      <path d='M48 58c4 6 20 6 24 0' stroke='#111827' stroke-width='2' fill='none' stroke-linecap='round' />
    </svg>
  `

  const uri = "data:image/svg+xml;utf8," + encodeURIComponent(svg)

  return (
    <div className="w-40 h-48 bg-transparent rounded-md overflow-hidden flex items-center justify-center">
      <img src={uri} alt="avatar preview" className="w-full h-full object-contain" />
    </div>
  )
}

export default function ProfileDesigner() {
  const auth = useAuth()
  const router = useRouter()

  const [skinTone, setSkinTone] = useState<string>("#F3C9A6")
  const [hairColor, setHairColor] = useState<string>("#2E1A0F")
  const [outfitColor, setOutfitColor] = useState<string>("#2563EB")
  const [background, setBackground] = useState<string>("#ffffff00")
  const [hairStyle, setHairStyle] = useState<string>("default")
  const [outfitStyle, setOutfitStyle] = useState<string>("default")
  const [glasses, setGlasses] = useState<string | null>(null)
  const [glassesColor, setGlassesColor] = useState<string>("#111827")
  const [glassesSize, setGlassesSize] = useState<number>(1)
  const [highlights, setHighlights] = useState<string | null>(null)
  const [hat, setHat] = useState<string | null>(null)
  const [presetName, setPresetName] = useState<string>("")
  const [savedPresets, setSavedPresets] = useState<Preset[]>(() => {
    try {
      const data = localStorage.getItem('avatarPresets')
      return data ? JSON.parse(data) : []
    } catch (e) {
      return []
    }
  })
  const [saved, setSaved] = useState(false)


  const presets: Preset[] = [
    { name: "Blue Rider", skin: "#F3C9A6", hair: "#2E1A0F", outfit: "#2563EB", background: "#ffffff00" },
    { name: "Sunny", skin: "#FFD7B5", hair: "#E07A5F", outfit: "#F2C94C", background: "#FFF7E6" },
    { name: "Night", skin: "#E0C7A6", hair: "#111827", outfit: "#0EA5A4", background: "#0F172A" },
  ]

  const buildSvg = ({ skin, hair, outfit, background, hairStyle, outfitStyle, glasses, highlights, hat, glassesColor, glassesSize }: { skin: string; hair: string; outfit: string; background?: string; hairStyle?: string; outfitStyle?: string; glasses?: string | null; highlights?: string | null; hat?: string | null; glassesColor?: string; glassesSize?: number }) => {
    const hairPart = (() => {
      switch (hairStyle) {
        case 'spiky':
          return `<path d='M26 40c6-14 10-22 34-22s24 8 34 22c0 0-12-20-34-20S36 40 26 40z' fill='${hair}' />`
        case 'bob':
          return `<path d='M30 38c6-14 20-22 30-22s24 8 30 22c0 0-8-18-30-18S38 38 30 38z' fill='${hair}' />`
        case 'long':
          return `<path d='M24 46c8-6 8 22 36 22s24-28 36-22v28c0 0-8 16-36 16S32 94 24 74z' fill='${hair}' />`
        case 'ponytail':
          return `<path d='M30 34c8-18 22-26 30-26s22 8 30 26c0 0-6-6-30-6S36 34 30 34z' fill='${hair}' /><path d='M84 58c6 6 14 22 6 30s-20 4-26-6' fill='${hair}' />`
        default:
          return `<path d='M30 40c6-18 24-26 30-26s24 8 30 26c0 0-10-18-30-18S40 40 30 40z' fill='${hair}' />`
      }
    })()

    const outfitPart = (() => {
      switch (outfitStyle) {
        case 'hoodie':
          return `<rect x='14' y='78' width='92' height='50' rx='12' fill='${outfit}' /><path d='M60 78v-6' stroke='rgba(0,0,0,0.08)' stroke-width='3' />`
        case 'jacket':
          return `<rect x='18' y='82' width='84' height='40' rx='8' fill='${outfit}' /><path d='M40 92h40' stroke='rgba(255,255,255,0.06)' stroke-width='2' />`
        case 'sweater':
          return `<rect x='16' y='80' width='88' height='46' rx='10' fill='${outfit}' /><path d='M30 94h60' stroke='rgba(255,255,255,0.04)' stroke-width='2' />`
        default:
          return `<rect x='18' y='84' width='84' height='44' rx='8' fill='${outfit}' />`
      }
    })()

    const glassesPart = (() => {
      if (!glasses) return ''
      const color = glassesColor || '#111827'
      const size = glassesSize || 1
      if (glasses === 'round') return `<g transform='translate(60 ${46 - (6 * (size - 1))}) scale(${size}) translate(-60 ${-(46 - (6 * (size - 1)))})' stroke='${color}' stroke-width='2' fill='none'><circle cx='50' cy='46' r='6'/><circle cx='70' cy='46' r='6'/><path d='M56 46h8' stroke='${color}' stroke-width='1.5'/></g>`
      if (glasses === 'square') return `<g transform='translate(60 ${46 - (6 * (size - 1))}) scale(${size}) translate(-60 ${-(46 - (6 * (size - 1)))})' stroke='${color}' stroke-width='2' fill='none'><rect x='44' y='40' width='12' height='12' rx='2'/><rect x='64' y='40' width='12' height='12' rx='2'/><path d='M56 46h8' stroke='${color}' stroke-width='1.5'/></g>`
      return ''
    })()

    const highlightPart = highlights ? `<path d='M48 28c6-6 20-6 28 0' fill='${highlights}' opacity='0.35' />` : ''
    const hatPart = (() => {
      if (!hat) return ''
      switch (hat) {
        case 'beanie':
          return `<path d='M22 28c10-14 76-14 86 0v8c0 0-14-18-43-18S35 36 22 36z' fill='#222' />`
        case 'fedora':
          return `<path d='M16 30c22-18 88-18 104 0c0 0-20-4-52-4S36 30 16 30z' fill='#2B2B2B' /><rect x='26' y='34' width='68' height='8' rx='4' fill='#1F2937' />`
        default:
          return ''
      }
    })()

    return `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 140' width='240' height='280'>
        <rect width='120' height='140' rx='12' fill='${background || "transparent"}' />
        ${outfitPart}
        <rect x='52' y='66' width='16' height='10' rx='3' fill='${skin}' />
        <circle cx='60' cy='46' r='28' fill='${skin}' />
        ${hairPart}
        <circle cx='50' cy='46' r='3' fill='#111827' />
        <circle cx='70' cy='46' r='3' fill='#111827' />
        ${glassesPart}
        ${highlightPart}
        ${hatPart}
        <path d='M48 58c4 6 20 6 24 0' stroke='#111827' stroke-width='2' fill='none' stroke-linecap='round' />
      </svg>
    `
  }

  const handleApply = (onSaved?: () => void) => {
    const svg = buildSvg({ skin: skinTone, hair: hairColor, outfit: outfitColor, background, hairStyle, outfitStyle, glasses, highlights, hat, glassesColor, glassesSize })
    const uri = "data:image/svg+xml;utf8," + encodeURIComponent(svg)

    // Try to rasterize SVG into a PNG at higher resolution for better image quality
    const rasterize = async (svgUri: string, target = 512) => {
      return new Promise<string>((resolve, reject) => {
        try {
          const img = new Image()
          img.onload = () => {
            try {
              const viewW = 120
              const viewH = 140
              const canvas = document.createElement('canvas')
              canvas.width = target
              canvas.height = target
              const ctx = canvas.getContext('2d')
              if (!ctx) return reject(new Error('Could not get canvas context'))
              // fill transparent background
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              // compute scale to fit SVG into square canvas while preserving aspect
              const scale = Math.min(canvas.width / viewW, canvas.height / viewH)
              const drawW = viewW * scale
              const drawH = viewH * scale
              const offsetX = Math.round((canvas.width - drawW) / 2)
              const offsetY = Math.round((canvas.height - drawH) / 2)
              ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
              const png = canvas.toDataURL('image/png')
              resolve(png)
            } catch (e) {
              reject(e)
            }
          }
          img.onerror = (err) => reject(err)
          img.src = svgUri
        } catch (e) {
          reject(e)
        }
      })
    }

    rasterize(uri, 512)
      .then((png) => {
        try {
          if (auth && (auth as any).updateUser) {
            ;(auth as any).updateUser({ avatar: png })
            setSaved(true)
            if (onSaved) onSaved()
            setTimeout(() => router.push('/profile'), 300)
            return
          }
        } catch (e) {
          console.error(e)
        }

        const stored = localStorage.getItem("darkChatUser")
        if (stored) {
          try {
            const user = JSON.parse(stored)
            user.avatar = png
            localStorage.setItem("darkChatUser", JSON.stringify(user))
            if (onSaved) onSaved()
            else {
              setSaved(true)
              setTimeout(() => window.location.reload(), 300)
            }
          } catch (e) {
            console.error("Failed to save avatar", e)
          }
        }
      })
      .catch((err) => {
        // fallback to SVG data URI if rasterization fails
        console.warn('Rasterize failed, falling back to SVG avatar', err)
        try {
          if (auth && (auth as any).updateUser) {
            ;(auth as any).updateUser({ avatar: uri })
            setSaved(true)
            if (onSaved) onSaved()
            setTimeout(() => router.push('/profile'), 300)
            return
          }
        } catch (e) {
          console.error(e)
        }

        const stored = localStorage.getItem("darkChatUser")
        if (stored) {
          try {
            const user = JSON.parse(stored)
            user.avatar = uri
            localStorage.setItem("darkChatUser", JSON.stringify(user))
            if (onSaved) onSaved()
            else {
              setSaved(true)
              setTimeout(() => window.location.reload(), 300)
            }
          } catch (e) {
            console.error("Failed to save avatar", e)
          }
        }
      })
  }

  const handleDownload = () => {
    const svg = buildSvg({ skin: skinTone, hair: hairColor, outfit: outfitColor, background, hairStyle, outfitStyle, glasses, highlights, hat, glassesColor, glassesSize })
    const uri = "data:image/svg+xml;utf8," + encodeURIComponent(svg)

    // try to download PNG rasterized at higher resolution, fallback to SVG
    const rasterizeAndDownload = async (svgUri: string, size = 1024) => {
      try {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('No canvas context')
          const viewW = 120
          const viewH = 140
          const scale = Math.min(canvas.width / viewW, canvas.height / viewH)
          const drawW = viewW * scale
          const drawH = viewH * scale
          const offsetX = Math.round((canvas.width - drawW) / 2)
          const offsetY = Math.round((canvas.height - drawH) / 2)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
          const png = canvas.toDataURL('image/png')
          const link = document.createElement('a')
          link.href = png
          link.download = 'avatar.png'
          document.body.appendChild(link)
          link.click()
          link.remove()
        }
        img.onerror = () => {
          throw new Error('Image load failed')
        }
        img.src = uri
      } catch (e) {
        // fallback to SVG download
        const link = document.createElement('a')
        link.href = uri
        link.download = 'avatar.svg'
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
    }

    rasterizeAndDownload(uri, 1024)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Preview */}
        <div className="col-span-1 flex flex-col items-center gap-4">
          <div className="p-4 bg-card rounded-md">
            <AvatarPreview skin={skinTone} hair={hairColor} outfit={outfitColor} background={background} hairStyle={hairStyle} outfitStyle={outfitStyle} glasses={glasses} highlights={highlights} hat={hat} glassesColor={glassesColor} glassesSize={glassesSize} />
          </div>
          <div className="text-center text-sm text-muted-foreground">Preview updates live as you change controls</div>
        </div>

        {/* Right: Controls (span 2) */}
        <div className="col-span-2 space-y-4">
          <details className="bg-card p-4 rounded-md" open>
            <summary className="font-semibold cursor-pointer">Appearance</summary>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="skinTone" className="block text-sm mb-1">Skin Tone</Label>
                <input id="skinTone" aria-label="Skin Tone" type="color" value={skinTone} onChange={(e) => setSkinTone(e.target.value)} className="w-12 h-8 p-0 border-0" />
              </div>
              <div>
                <Label htmlFor="background" className="block text-sm mb-1">Background</Label>
                <input id="background" aria-label="Background Color" type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="w-12 h-8 p-0 border-0" />
              </div>
              <div>
                <Label htmlFor="highlights" className="block text-sm mb-1">Highlights</Label>
                <input id="highlights" aria-label="Highlights Color" type="color" value={highlights ?? '#ffffff'} onChange={(e) => setHighlights(e.target.value)} className="w-12 h-8 p-0 border-0" />
              </div>
              <div>
                <Label htmlFor="hat" className="block text-sm mb-1">Hat</Label>
                <select id="hat" aria-label="Hat" value={hat ?? ''} onChange={(e) => setHat(e.target.value || null)} className="p-2 rounded-md bg-card text-foreground">
                  <option value="">No hat</option>
                  <option value="beanie">Beanie</option>
                  <option value="fedora">Fedora</option>
                </select>
              </div>
            </div>
          </details>

          <details className="bg-card p-4 rounded-md" open>
            <summary className="font-semibold cursor-pointer">Hair</summary>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hairColor" className="block text-sm mb-1">Hair Color</Label>
                <input id="hairColor" aria-label="Hair Color" type="color" value={hairColor} onChange={(e) => setHairColor(e.target.value)} className="w-12 h-8 p-0 border-0" />
              </div>
              <div>
                <Label htmlFor="hairStyle" className="block text-sm mb-1">Hair Style</Label>
                <select id="hairStyle" aria-label="Hair Style" value={hairStyle} onChange={(e) => setHairStyle(e.target.value)} className="w-full p-2 rounded-md bg-card text-foreground">
                  <option value="default">Default</option>
                  <option value="spiky">Spiky</option>
                  <option value="bob">Bob</option>
                  <option value="long">Long</option>
                  <option value="ponytail">Ponytail</option>
                </select>
              </div>
            </div>
          </details>

          <details className="bg-card p-4 rounded-md" open>
            <summary className="font-semibold cursor-pointer">Outfit</summary>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="outfitColor" className="block text-sm mb-1">Outfit Color</Label>
                <input id="outfitColor" aria-label="Outfit Color" type="color" value={outfitColor} onChange={(e) => setOutfitColor(e.target.value)} className="w-12 h-8 p-0 border-0" />
              </div>
              <div>
                <Label htmlFor="outfitStyle" className="block text-sm mb-1">Outfit Style</Label>
                <select id="outfitStyle" aria-label="Outfit Style" value={outfitStyle} onChange={(e) => setOutfitStyle(e.target.value)} className="p-2 rounded-md bg-card text-foreground">
                  <option value="default">Default</option>
                  <option value="hoodie">Hoodie</option>
                  <option value="jacket">Jacket</option>
                  <option value="sweater">Sweater</option>
                </select>
              </div>
            </div>
          </details>

          <details className="bg-card p-4 rounded-md" open>
            <summary className="font-semibold cursor-pointer">Accessories</summary>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="glassesType" className="block text-sm mb-1">Glasses</Label>
                <select id="glassesType" aria-label="Glasses Type" value={glasses ?? ''} onChange={(e) => setGlasses(e.target.value || null)} className="p-2 rounded-md bg-card text-foreground">
                  <option value="">No glasses</option>
                  <option value="round">Round</option>
                  <option value="square">Square</option>
                </select>
              </div>

              <div>
                <Label htmlFor="glassesColor" className="block text-sm mb-1">Glasses Color</Label>
                <input id="glassesColor" aria-label="Glasses Color" type="color" value={glassesColor} onChange={(e) => setGlassesColor(e.target.value)} className="w-12 h-8 p-0 border-0" />
              </div>

              <div>
                <Label htmlFor="glassesSize" className="block text-sm mb-1">Glasses Size</Label>
                <input id="glassesSize" aria-label="Glasses Size" type="range" min={0.7} max={1.6} step={0.1} value={glassesSize} onChange={(e) => setGlassesSize(Number(e.target.value))} />
              </div>
            </div>
          </details>

          <details className="bg-card p-4 rounded-md">
            <summary className="font-semibold cursor-pointer">Presets</summary>
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="presets" className="block text-sm mb-1">Built-in</Label>
                  <select id="presets" aria-label="Avatar Presets" onChange={(e) => {
                    const p = presets.find(x => x.name === e.target.value)
                    if (p) {
                      setSkinTone(p.skin)
                      setHairColor(p.hair)
                      setOutfitColor(p.outfit)
                      setBackground(p.background)
                      setOutfitStyle(p.outfitStyle || 'default')
                      setHairStyle(p.hairStyle || 'default')
                      setGlasses(p.glasses || null)
                      setHighlights(p.highlights || null)
                      setHat(p.hat || null)
                    }
                  }} className="w-full p-2 rounded-md bg-card text-foreground">
                    
                    <option value="">Choose...</option>
                    {presets.map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="block text-sm mb-1">Your Presets</Label>
                  <div className="space-y-2">
                    {savedPresets.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No saved presets</div>
                    ) : (
                      savedPresets.map((sp) => (
                        <div key={sp.name} className="flex items-center justify-between">
                          <div className="text-sm">{sp.name}</div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => {
                              setSkinTone(sp.skin)
                              setHairColor(sp.hair)
                              setOutfitColor(sp.outfit)
                              setBackground(sp.background)
                              setHairStyle(sp.hairStyle || 'default')
                              setOutfitStyle(sp.outfitStyle || 'default')
                              setGlasses(sp.glasses || null)
                              setHighlights(sp.highlights || null)
                              setHat(sp.hat || null)
                            }}>Load</Button>
                            <Button variant="ghost" onClick={() => {
                              const next = savedPresets.filter(x => x.name !== sp.name)
                              setSavedPresets(next)
                              localStorage.setItem('avatarPresets', JSON.stringify(next))
                            }}>Delete</Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <Label htmlFor="presetName" className="block text-xs mb-1">Save current as preset</Label>
                <div className="flex gap-2">
                  <input id="presetName" placeholder="Preset name" value={presetName} onChange={(e) => setPresetName(e.target.value)} className="flex-1 p-2 rounded-md border bg-card text-foreground placeholder:text-muted-foreground" />
                  <Button onClick={() => {
                    if (!presetName) return
                    const newPreset: Preset = { name: presetName, skin: skinTone, hair: hairColor, outfit: outfitColor, background, hairStyle, outfitStyle, glasses, highlights, hat }
                    const next = [...savedPresets.filter(s => s.name !== presetName), newPreset]
                    setSavedPresets(next)
                    localStorage.setItem('avatarPresets', JSON.stringify(next))
                    setPresetName('')
                  }}>Save</Button>
                </div>
              </div>
            </div>
          </details>

          <div className="bg-card p-4 rounded-md flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <Button variant="outline" onClick={() => { setSkinTone('#F3C9A6'); setHairColor('#2E1A0F'); setOutfitColor('#2563EB'); setBackground('#ffffff00'); setHairStyle('default'); setOutfitStyle('default'); setGlasses(null); setHighlights(null); setHat(null) }}>Reset</Button>
              <Button onClick={() => handleApply()}>Save</Button>
              <Button variant="ghost" onClick={handleDownload}>Download</Button>
            </div>
            <div>{saved && <div className="text-sm text-green-500">Saved — redirecting...</div>}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
