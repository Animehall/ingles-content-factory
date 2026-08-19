import { useState } from 'react'
import { Sparkles, CalendarDays, History, Download } from 'lucide-react'

const demo = [
  { en: "I'm almost there.", pt: 'Estou quase chegando.', pro: 'áim ólmoust dér' },
  { en: 'Give me a minute.', pt: 'Me dá um minuto.', pro: 'guív mi a mínit' },
  { en: "I'll let you know.", pt: 'Eu te aviso.', pro: 'áil létchu nou' },
  { en: 'Take your time.', pt: 'Sem pressa.', pro: 'têik iór táim' }
]

export default function App() {
  const [count, setCount] = useState(7)
  const [topic, setTopic] = useState('Geral')
  const [items, setItems] = useState(demo)
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, phrasesPerPost: 4, posts: count })
      })
      const data = await res.json()
      setItems(data.preview || demo)
    } finally { setLoading(false) }
  }

  return <div className="app">
    <aside>
      <div className="brand">Content Factory</div>
      <nav>
        <button className="active"><Sparkles size={18}/> Gerar</button>
        <button><CalendarDays size={18}/> Calendário</button>
        <button><History size={18}/> Histórico</button>
      </nav>
    </aside>

    <main>
      <div className="eyebrow">INGLÊS SEM MEDO</div>
      <h1>Gerar semana de conteúdo</h1>
      <p className="lead">Crie frases, pronúncia, CTA e legenda prontos para TikTok em poucos cliques.</p>

      <section className="panel form-grid">
        <label>Tema
          <select value={topic} onChange={e=>setTopic(e.target.value)}>
            {['Geral','Trabalho','Viagem','Relacionamento','Restaurante','Compras'].map(x=><option key={x}>{x}</option>)}
          </select>
        </label>
        <label>Quantidade de posts
          <select value={count} onChange={e=>setCount(Number(e.target.value))}>
            {[1,3,5,7,14,30].map(x=><option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label>Frases por post<input value="4" disabled /></label>
        <button className="generate" onClick={generate} disabled={loading}>{loading?'Gerando...':'⚡ Gerar conteúdo'}</button>
      </section>

      <section className="panel">
        <div className="row"><div><div className="eyebrow">PRÉVIA</div><h2>Post 01</h2></div><button className="ghost"><Download size={18}/> Exportar</button></div>
        <div className="cards">{items.map((x,i)=><article key={i}>
          <span className="num">0{i+1}</span>
          <strong>{x.en}</strong><p>{x.pt}</p><small>🗣️ {x.pro}</small>
        </article>)}</div>
        <div className="cta"><b>CTA do carrossel</b><span>📘 Quer aprender mais? Inglês Sem Medo grátis — link na bio.</span></div>
        <div className="caption"><b>Legenda TikTok</b><span>🇺🇸 Frases para usar no inglês do dia a dia. 📘 Aprenda mais no link da bio.<br/>#ingles #aprenderingles #inglesdodiaadia #inglesparainiciantes #inglesdozero</span></div>
      </section>
    </main>
  </div>
}
