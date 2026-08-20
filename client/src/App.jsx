import { useMemo, useState } from 'react'
import { Sparkles, CalendarDays, History, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { exportPostAsZip } from './exportCarousel'

const demo = [
  { en: "I'm almost there.", pt: 'Estou quase chegando.', pro: 'áim ólmoust dér' },
  { en: 'Give me a minute.', pt: 'Me dá um minuto.', pro: 'guív mi a mínit' },
  { en: "I'll let you know.", pt: 'Eu te aviso.', pro: 'áil létchu nou' },
  { en: 'Take your time.', pt: 'Sem pressa.', pro: 'têik iór táim' }
]

const defaultCta = '📘 Quer aprender mais? Inglês Sem Medo grátis — link na bio.'
const defaultCaption = '🇺🇸 Frases para usar no inglês do dia a dia. 📘 Aprenda mais no link da bio. #ingles #aprenderingles #inglesdodiaadia #inglesparainiciantes #inglesdozero'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function App() {
  const [count, setCount] = useState(7)
  const [topic, setTopic] = useState('Geral')
  const [generatedPosts, setGeneratedPosts] = useState([])
  const [activePost, setActivePost] = useState(0)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [meta, setMeta] = useState(null)

  const current = useMemo(() => {
    if (generatedPosts.length) return generatedPosts[activePost]
    return { phrases: demo, cta: defaultCta, caption: defaultCaption }
  }, [generatedPosts, activePost])

  async function generate() {
    setLoading(true)
    setError('')
    setWarning('')
    try {
      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, phrasesPerPost: 4, posts: count })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.error || 'Erro ao gerar conteúdo.')

      const posts = data.posts?.length
        ? data.posts
        : [{ phrases: data.preview || demo, cta: data.cta || defaultCta, caption: data.caption || defaultCaption }]

      setGeneratedPosts(posts)
      setActivePost(0)
      setMeta(data.meta || null)
      setWarning(data.warning || '')
    } catch (err) {
      setError(err.message || 'Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  async function exportCurrentPost() {
    setExporting(true)
    setError('')
    try {
      await exportPostAsZip({
        post: current,
        postNumber: activePost + 1,
        topic
      })
    } catch (err) {
      setError(err.message || 'Não foi possível exportar o carrossel.')
    } finally {
      setExporting(false)
    }
  }

  function previousPost() {
    setActivePost(i => Math.max(0, i - 1))
  }

  function nextPost() {
    setActivePost(i => Math.min(generatedPosts.length - 1, i + 1))
  }

  const items = current.phrases || demo

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
      <div className="eyebrow">INGLÊS SEM MEDO • MOTOR LOCAL GRÁTIS</div>
      <h1>Gerar semana de conteúdo</h1>
      <p className="lead">Crie frases, pronúncia, CTA, legenda e slides prontos para TikTok sem API paga.</p>

      <section className="panel form-grid">
        <label>Tema
          <select value={topic} onChange={e=>setTopic(e.target.value)}>
            {['Geral','Trabalho','Viagem','Relacionamento','Restaurante','Compras'].map(x=><option key={x}>{x}</option>)}
          </select>
        </label>
        <label>Quantidade de posts
          <select value={count} onChange={e=>setCount(Number(e.target.value))}>
            {[1,3,5,7,14].map(x=><option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label>Frases por post<input value="4" disabled readOnly /></label>
        <button className="generate" onClick={generate} disabled={loading}>{loading?'Montando lote...':'⚡ Gerar conteúdo'}</button>
      </section>

      {error && <div className="notice error"><b>Erro:</b> {error}</div>}
      {warning && <div className="notice warning"><b>Aviso:</b> {warning}</div>}

      <section className="panel">
        <div className="row">
          <div>
            <div className="eyebrow">PRÉVIA {meta?.source === 'local' ? '• LOCAL • R$ 0' : ''}</div>
            <h2>Post {String(activePost + 1).padStart(2, '0')}</h2>
          </div>
          <div className="actions">
            {generatedPosts.length > 1 && <div className="pager">
              <button className="ghost icon" onClick={previousPost} disabled={activePost === 0}><ChevronLeft size={18}/></button>
              <span>{activePost + 1} / {generatedPosts.length}</span>
              <button className="ghost icon" onClick={nextPost} disabled={activePost === generatedPosts.length - 1}><ChevronRight size={18}/></button>
            </div>}
            <button className="ghost" onClick={exportCurrentPost} disabled={exporting}>
              <Download size={18}/> {exporting ? 'Exportando...' : 'Exportar PNG'}
            </button>
          </div>
        </div>

        <div className="cards">{items.map((x,i)=><article key={`${x.en}-${i}`}>
          <span className="num">{String(i+1).padStart(2,'0')}</span>
          <strong>{x.en}</strong><p>{x.pt}</p><small>🗣️ {x.pro}</small>
        </article>)}</div>
        <div className="cta"><b>CTA do carrossel</b><span>{current.cta || defaultCta}</span></div>
        <div className="caption"><b>Legenda TikTok</b><span>{current.caption || defaultCaption}</span></div>
        <div className="export-note">A exportação gera um ZIP com capa + 4 slides PNG em 1080×1350, além de legenda.txt e cta.txt.</div>
      </section>
    </main>
  </div>
}
