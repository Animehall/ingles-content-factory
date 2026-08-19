# Inglês Content Factory

MVP para geração de conteúdo em carrossel para TikTok no nicho de inglês.

## Objetivo

Gerar lotes de posts com:
- 4 frases em inglês do dia a dia
- tradução PT-BR
- pronúncia americana simplificada para brasileiros
- CTA para o eBook **Inglês Sem Medo**
- legenda TikTok com hashtags
- histórico para evitar repetição de frases
- exportação futura de slides em PNG

## Estrutura

- `client/`: interface React + Vite
- `server/`: API Node.js + Express

## v0.2

A v0.2 adiciona geração real com a OpenAI API, logs das requisições no terminal, geração de múltiplos posts em um único lote e navegação entre os posts gerados.

Se `OPENAI_API_KEY` não estiver configurada, o servidor continua funcionando em modo demonstração.

## Configuração local

### Backend

```bash
cd server
npm install
copy .env.example .env
```

Abra `server/.env` e informe sua chave:

```env
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-5-mini
```

Depois execute:

```bash
npm run dev
```

### Frontend

Em outro terminal:

```bash
cd client
npm install
npm run dev
```

O frontend usa `http://localhost:3001` por padrão. Para trocar a URL da API, copie `client/.env.example` para `client/.env` e altere `VITE_API_URL`.

## Regras de geração

- inglês americano natural (General American)
- português brasileiro natural
- pronúncia escrita de forma legível para brasileiros
- sem IPA ou caracteres fonéticos como `ə`, `ɚ`, `æ`, `ʌ`, `θ`
- CTA curto com referência ao link na bio
- legenda TikTok curta com hashtags relevantes
