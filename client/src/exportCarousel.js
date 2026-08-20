import JSZip from 'jszip'

const WIDTH = 1080
const HEIGHT = 1350

function slugify(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'post'
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function background(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  gradient.addColorStop(0, '#07131f')
  gradient.addColorStop(0.55, '#0c2630')
  gradient.addColorStop(1, '#0b1b27')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.globalAlpha = 0.16
  ctx.fillStyle = '#70e4ab'
  ctx.beginPath()
  ctx.arc(930, 150, 320, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 0.09
  ctx.fillStyle = '#f4d35e'
  ctx.beginPath()
  ctx.arc(120, 1230, 340, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  const sky = ctx.createLinearGradient(0, 780, 0, HEIGHT)
  sky.addColorStop(0, 'rgba(18,52,57,.1)')
  sky.addColorStop(1, 'rgba(2,8,13,.8)')
  ctx.fillStyle = sky
  ctx.fillRect(0, 780, WIDTH, HEIGHT - 780)
}

function brand(ctx, pageText) {
  ctx.fillStyle = '#73e6aa'
  ctx.font = '700 28px Arial, sans-serif'
  ctx.letterSpacing = '2px'
  ctx.fillText('INGLÊS SEM MEDO', 72, 84)

  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(255,255,255,.58)'
  ctx.font = '600 24px Arial, sans-serif'
  ctx.fillText(pageText, WIDTH - 72, 84)
  ctx.textAlign = 'left'
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function fitFont(ctx, text, maxWidth, start = 88, min = 52, weight = 900) {
  let size = start
  while (size > min) {
    ctx.font = `${weight} ${size}px Arial, sans-serif`
    if (wrapText(ctx, text, maxWidth).length <= 2) return size
    size -= 2
  }
  return min
}

function drawCenteredLines(ctx, text, y, maxWidth, size, color, lineHeight = 1.08, weight = 800) {
  ctx.font = `${weight} ${size}px Arial, sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  const lines = wrapText(ctx, text, maxWidth)
  const h = size * lineHeight
  lines.forEach((line, index) => ctx.fillText(line, WIDTH / 2, y + index * h))
  ctx.textAlign = 'left'
  return y + Math.max(1, lines.length) * h
}

function makeCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  return canvas
}

function drawCover(topic, phraseCount) {
  const canvas = makeCanvas()
  const ctx = canvas.getContext('2d')
  background(ctx)
  brand(ctx, '01')

  ctx.fillStyle = 'rgba(255,255,255,.06)'
  roundedRect(ctx, 72, 220, 936, 760, 44)
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#f4d35e'
  ctx.font = '800 34px Arial, sans-serif'
  ctx.fillText(String(topic).toUpperCase(), WIDTH / 2, 345)

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 104px Arial, sans-serif'
  ctx.fillText(`${phraseCount} FRASES`, WIDTH / 2, 500)
  ctx.font = '900 82px Arial, sans-serif'
  ctx.fillText('EM INGLÊS', WIDTH / 2, 605)

  ctx.fillStyle = '#c9d7df'
  ctx.font = '500 38px Arial, sans-serif'
  ctx.fillText('para usar no dia a dia 🇺🇸', WIDTH / 2, 710)

  ctx.fillStyle = '#73e6aa'
  ctx.font = '700 28px Arial, sans-serif'
  ctx.fillText('INGLÊS  •  PORTUGUÊS  •  PRONÚNCIA', WIDTH / 2, 865)
  ctx.textAlign = 'left'

  ctx.fillStyle = 'rgba(255,255,255,.68)'
  ctx.font = '600 28px Arial, sans-serif'
  ctx.fillText('Arraste para o lado →', 72, 1245)

  return canvas
}

function drawPhraseSlide(phrase, index, total, cta, includeCta) {
  const canvas = makeCanvas()
  const ctx = canvas.getContext('2d')
  background(ctx)
  brand(ctx, String(index + 2).padStart(2, '0'))

  ctx.fillStyle = 'rgba(255,255,255,.06)'
  roundedRect(ctx, 72, 175, 936, includeCta ? 885 : 990, 42)
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.font = '700 30px Arial, sans-serif'
  ctx.fillStyle = '#73e6aa'
  ctx.fillText(`FRASE ${String(index + 1).padStart(2, '0')}  •  ${index + 1}/${total}`, WIDTH / 2, 265)
  ctx.textAlign = 'left'

  const enSize = fitFont(ctx, phrase.en, 830, 94, 58, 900)
  let y = drawCenteredLines(ctx, `🇺🇸 ${phrase.en}`, 420, 840, enSize, '#ffffff', 1.06, 900)

  y += 80
  const ptSize = fitFont(ctx, phrase.pt, 820, 70, 46, 800)
  y = drawCenteredLines(ctx, `🇧🇷 ${phrase.pt}`, y, 840, ptSize, '#f4d35e', 1.08, 800)

  y += 80
  ctx.fillStyle = 'rgba(115,230,170,.12)'
  roundedRect(ctx, 150, y - 48, 780, 132, 28)
  ctx.fill()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#73e6aa'
  ctx.font = '700 42px Arial, sans-serif'
  ctx.fillText(`🗣️ ${phrase.pro}`, WIDTH / 2, y + 28)
  ctx.textAlign = 'left'

  if (includeCta) {
    ctx.fillStyle = 'rgba(0,0,0,.34)'
    roundedRect(ctx, 72, 1090, 936, 170, 34)
    ctx.fill()
    ctx.fillStyle = '#f4d35e'
    ctx.font = '800 30px Arial, sans-serif'
    ctx.fillText('📘 EBOOK GRÁTIS', 112, 1152)
    ctx.fillStyle = '#ffffff'
    ctx.font = '700 30px Arial, sans-serif'
    const cleanCta = String(cta || 'Quer aprender mais? Inglês Sem Medo grátis — link na bio.')
      .replace(/^📘\s*/, '')
    const lines = wrapText(ctx, cleanCta, 820).slice(0, 2)
    lines.forEach((line, i) => ctx.fillText(line, 112, 1204 + i * 38))
  } else {
    ctx.fillStyle = 'rgba(255,255,255,.56)'
    ctx.font = '600 25px Arial, sans-serif'
    ctx.fillText('Salve para praticar depois.', 72, 1245)
  }

  return canvas
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Falha ao gerar PNG.')), 'image/png', 1)
  })
}

export async function exportPostAsZip({ post, postNumber = 1, topic = 'Geral' }) {
  if (!post?.phrases?.length) throw new Error('Nenhuma frase disponível para exportar.')

  const zip = new JSZip()
  const folderName = `post-${String(postNumber).padStart(2, '0')}-${slugify(topic)}`
  const folder = zip.folder(folderName)

  const cover = drawCover(topic, post.phrases.length)
  folder.file('01-capa.png', await canvasToBlob(cover))

  for (let index = 0; index < post.phrases.length; index += 1) {
    const slide = drawPhraseSlide(
      post.phrases[index],
      index,
      post.phrases.length,
      post.cta,
      index === post.phrases.length - 1
    )
    folder.file(`${String(index + 2).padStart(2, '0')}-frase.png`, await canvasToBlob(slide))
  }

  folder.file('legenda.txt', `${post.caption || ''}\n`)
  folder.file('cta.txt', `${post.cta || ''}\n`)

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${folderName}.zip`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}