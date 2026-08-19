import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_,res)=>res.json({ok:true,version:'0.1.0'}))

app.post('/api/generate', (req,res)=>{
  const { topic='Geral', posts=7, phrasesPerPost=4 } = req.body || {}
  res.json({
    meta:{topic,posts,phrasesPerPost},
    preview:[
      {en:"I'm almost there.",pt:'Estou quase chegando.',pro:'áim ólmoust dér'},
      {en:'Give me a minute.',pt:'Me dá um minuto.',pro:'guív mi a mínit'},
      {en:"I'll let you know.",pt:'Eu te aviso.',pro:'áil létchu nou'},
      {en:'Take your time.',pt:'Sem pressa.',pro:'têik iór táim'}
    ],
    cta:'📘 Quer aprender mais? Inglês Sem Medo grátis — link na bio.',
    caption:'🇺🇸 Frases para usar no inglês do dia a dia. 📘 Aprenda mais no link da bio. #ingles #aprenderingles #inglesdodiaadia #inglesparainiciantes #inglesdozero'
  })
})

const port = process.env.PORT || 3001
app.listen(port,()=>console.log(`API on http://localhost:${port}`))
