import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { phraseBank } from './phrases.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 3001
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.resolve(__dirname, '../data')
const historyFile = path.join(dataDir, 'history.json')

function now() {
  return new Date().toLocaleTimeString('pt-BR', { hour12: false })
}

function ensureHistoryFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(historyFile)) fs.writeFileSync(historyFile, JSON.stringify({ used: [] }, null, 2))
}

function readHistory() {
  ensureHistoryFile()
  try {
    const parsed = JSON.parse(fs.readFileSync(historyFile, 'utf8'))
    return Array.isArray(parsed.used) ? parsed.used : []
  } catch {
    return []
  }
}

function writeHistory(used) {
  ensureHistoryFile()
  fs.writeFileSync(historyFile, JSON.stringify({ used }, null, 2))
}

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function ctaFor(topic) {
  const map = {
    Trabalho: '📘 Quer aprender mais inglês para o trabalho? Inglês Sem Medo grátis — link na bio.',
    Viagem: '📘 Quer viajar falando mais inglês? Inglês Sem Medo grátis — link na bio.',
    Relacionamento: '📘 Quer aprender mais frases assim? Inglês Sem Medo grátis — link na bio.',
    Restaurante: '📘 Mais inglês para situações reais? Inglês Sem Medo grátis — link na bio.',
    Compras: '📘 Quer aprender mais inglês do dia a dia? Inglês Sem Medo grátis — link na bio.'
  }
  return map[topic] || '📘 Quer aprender mais? Inglês Sem Medo grátis — link na bio.'
}

function captionFor(topic) {
  const map = {
    Trabalho: '🇺🇸 Frases úteis para usar no trabalho. 📘 Aprenda mais no link da bio. #ingles #inglesnotrabalho #aprenderingles #inglesdodiaadia #inglesparainiciantes',
    Viagem: '✈️ Inglês que pode salvar sua viagem. 📘 Aprenda mais no link da bio. #ingles #inglesparaviagem #aprenderingles #inglesdodiaadia #inglesparainiciantes',
    Relacionamento: '💬 Frases naturais para conversas do dia a dia. 📘 Aprenda mais no link da bio. #ingles #aprenderingles #inglesdodiaadia #inglesparainiciantes #inglesdozero',
    Restaurante: '🍽️ Inglês útil para restaurantes. 📘 Aprenda mais no link da bio. #ingles #inglesparaviagem #aprenderingles #inglesdodiaadia #inglesparainiciantes',
    Compras: '🛍️ Inglês que você realmente usa nas compras. 📘 Aprenda mais no link da bio. #ingles #aprenderingles #inglesdodiaadia #inglesparainiciantes #inglesdozero'
  }
  return map[topic] || '🇺🇸 Frases para usar no inglês do dia a dia. 📘 Aprenda mais no link da bio. #ingles #aprenderingles #inglesdodiaadia #inglesparainiciantes #inglesdozero'
}

function buildCandidates(topic) {
  if (topic === 'Geral') return phraseBank
  return phraseBank.filter(item => item.topic === topic || item.topic === 'Geral')
}

function generateLocalPosts({ topic, posts, phrasesPerPost }) {
  const needed = posts * phrasesPerPost
  const candidates = buildCandidates(topic)
  let used = readHistory()
  let available = candidates.filter(item => !used.includes(item.en))
  let historyReset = false

  if (available.length < needed) {
    used = used.filter(en => !candidates.some(item => item.en === en))
    available = candidates
    historyReset = true
  }

  if (available.length < needed) {
    throw new Error(`A biblioteca atual tem ${available.length} frases disponíveis para este tema, mas foram solicitadas ${needed}. Reduza a quantidade de posts.`)
  }

  const picked = shuffle(available).slice(0, needed)
  const newUsed = [...new Set([...used, ...picked.map(item => item.en)])]
  writeHistory(newUsed)

  const generated = []
  for (let i = 0; i < posts; i++) {
    const phrases = picked.slice(i * phrasesPerPost, (i + 1) * phrasesPerPost)
    generated.push({
      phrases,
      cta: ctaFor(topic),
      caption: captionFor(topic)
    })
  }

  return { generated, historyReset, availableAfter: Math.max(0, candidates.length - picked.length) }
}

app.use((req, res, next) => {
  const started = Date.now()
  res.on('finish', () => {
    console.log(`[${now()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - started}ms)`)
  })
  next()
})

app.get('/health', (_, res) => res.json({
  ok: true,
  version: '0.3.0',
  engine: 'local-library',
  cost: 'free',
  librarySize: phraseBank.length,
  usedPhrases: readHistory().length
}))

app.get('/api/history', (_, res) => {
  const used = readHistory()
  res.json({ count: used.length, used })
})

app.delete('/api/history', (_, res) => {
  writeHistory([])
  console.log(`[${now()}] Histórico de frases zerado.`)
  res.json({ ok: true, count: 0 })
})

app.post('/api/generate', (req, res) => {
  const topic = String(req.body?.topic || 'Geral').trim()
  const posts = Math.min(Math.max(Number(req.body?.posts) || 7, 1), 14)
  const phrasesPerPost = Math.min(Math.max(Number(req.body?.phrasesPerPost) || 4, 1), 8)

  console.log(`[${now()}] Gerando localmente | tema=${topic} | posts=${posts} | frases/post=${phrasesPerPost}`)

  try {
    const { generated, historyReset, availableAfter } = generateLocalPosts({ topic, posts, phrasesPerPost })
    const first = generated[0]

    console.log(`[${now()}] Lote concluído: ${generated.length} post(s), ${posts * phrasesPerPost} frase(s), custo R$ 0.`)

    return res.json({
      meta: {
        topic,
        posts: generated.length,
        phrasesPerPost,
        source: 'local',
        engine: 'biblioteca-local',
        cost: 0,
        historyReset,
        availableAfter
      },
      posts: generated,
      preview: first.phrases,
      cta: first.cta,
      caption: first.caption,
      warning: historyReset ? 'A biblioteca deste tema já havia sido usada. O ciclo foi reiniciado automaticamente para evitar falta de frases.' : ''
    })
  } catch (error) {
    console.error(`[${now()}] Falha na geração local:`, error?.message || error)
    return res.status(400).json({
      error: 'Não foi possível montar o lote.',
      detail: error?.message || 'Erro desconhecido'
    })
  }
})

app.listen(port, () => {
  console.log(`Content Factory API v0.3.0 em http://localhost:${port}`)
  console.log(`Motor: biblioteca local (${phraseBank.length} frases) | custo: R$ 0`)
})
