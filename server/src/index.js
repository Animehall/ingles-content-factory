import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 3001
const model = process.env.OPENAI_MODEL || 'gpt-5-mini'
const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey }) : null

function now() {
  return new Date().toLocaleTimeString('pt-BR', { hour12: false })
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
  version: '0.2.0',
  aiConfigured: Boolean(openai),
  model: openai ? model : null
}))

const fallbackPreview = [
  { en: "I'm almost there.", pt: 'Estou quase chegando.', pro: 'áim ólmoust dér' },
  { en: 'Give me a minute.', pt: 'Me dá um minuto.', pro: 'guív mi a mínit' },
  { en: "I'll let you know.", pt: 'Eu te aviso.', pro: 'áil létchu nou' },
  { en: 'Take your time.', pt: 'Sem pressa.', pro: 'têik iór táim' }
]

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    posts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          phrases: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                en: { type: 'string' },
                pt: { type: 'string' },
                pro: { type: 'string' }
              },
              required: ['en', 'pt', 'pro']
            }
          },
          cta: { type: 'string' },
          caption: { type: 'string' }
        },
        required: ['phrases', 'cta', 'caption']
      }
    }
  },
  required: ['posts']
}

function buildPrompt({ topic, posts, phrasesPerPost }) {
  return `Você é o motor de conteúdo de uma página brasileira de TikTok que ensina inglês americano do dia a dia.

Gere exatamente ${posts} posts, cada um com exatamente ${phrasesPerPost} frases relacionadas ao tema "${topic}".

Regras obrigatórias:
- Inglês natural, útil e comum nos Estados Unidos. Priorize General American.
- Tradução em português do Brasil natural, curta e fiel ao sentido.
- Pronúncia aproximada escrita para brasileiros, usando SOMENTE letras e sinais comuns do português brasileiro.
- NÃO use IPA nem símbolos como ə, ɚ, æ, ʌ, θ, ð, ʃ, ʒ, ŋ.
- Pode usar acentos comuns do português para ajudar na leitura: á, é, í, ó, ú, â, ê etc.
- A pronúncia deve refletir fala americana natural sem ficar excessivamente técnica.
- Não repita frases dentro da mesma geração.
- Evite frases artificiais de livro didático.
- Cada post deve ter um CTA curto e discreto para o eBook gratuito "Inglês Sem Medo", deixando explícito que o link está na bio.
- Cada legenda deve ser curta, adequada ao TikTok, relacionada às frases daquele post, mencionar o link na bio e terminar com 4 a 6 hashtags relevantes.
- Não coloque markdown nos campos.

Retorne apenas os dados estruturados solicitados.`
}

app.post('/api/generate', async (req, res) => {
  const topic = String(req.body?.topic || 'Geral').trim()
  const posts = Math.min(Math.max(Number(req.body?.posts) || 7, 1), 30)
  const phrasesPerPost = Math.min(Math.max(Number(req.body?.phrasesPerPost) || 4, 1), 8)

  console.log(`[${now()}] Gerando conteúdo | tema=${topic} | posts=${posts} | frases/post=${phrasesPerPost}`)

  if (!openai) {
    console.warn(`[${now()}] OPENAI_API_KEY ausente. Usando conteúdo de demonstração.`)
    return res.json({
      meta: { topic, posts, phrasesPerPost, source: 'demo' },
      preview: fallbackPreview.slice(0, phrasesPerPost),
      cta: '📘 Quer aprender mais? Inglês Sem Medo grátis — link na bio.',
      caption: '🇺🇸 Frases para usar no inglês do dia a dia. 📘 Aprenda mais no link da bio. #ingles #aprenderingles #inglesdodiaadia #inglesparainiciantes #inglesdozero',
      warning: 'Configure OPENAI_API_KEY no arquivo server/.env para ativar a geração real.'
    })
  }

  try {
    const response = await openai.responses.create({
      model,
      input: buildPrompt({ topic, posts, phrasesPerPost }),
      text: {
        format: {
          type: 'json_schema',
          name: 'content_factory_posts',
          strict: true,
          schema
        }
      }
    })

    const parsed = JSON.parse(response.output_text)
    const generatedPosts = parsed.posts || []
    const first = generatedPosts[0]

    if (!first?.phrases?.length) {
      throw new Error('A IA retornou uma resposta vazia.')
    }

    console.log(`[${now()}] IA concluiu geração com ${generatedPosts.length} post(s) usando ${model}.`)

    return res.json({
      meta: { topic, posts: generatedPosts.length, phrasesPerPost, source: 'openai', model },
      posts: generatedPosts,
      preview: first.phrases,
      cta: first.cta,
      caption: first.caption
    })
  } catch (error) {
    console.error(`[${now()}] Falha na geração por IA:`, error?.message || error)
    return res.status(500).json({
      error: 'Não foi possível gerar o conteúdo por IA.',
      detail: error?.message || 'Erro desconhecido'
    })
  }
})

app.listen(port, () => {
  console.log(`Content Factory API v0.2.0 em http://localhost:${port}`)
  console.log(openai
    ? `IA ativa: ${model}`
    : 'IA desativada: configure OPENAI_API_KEY em server/.env')
})
