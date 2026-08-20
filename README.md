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

## v0.3 — motor local gratuito

A v0.3 remove a dependência da OpenAI API e usa uma biblioteca local de frases curadas. Não é necessário cadastrar chave de API e não há custo por geração.

O servidor também mantém um histórico local em `server/data/history.json` para reduzir repetição entre lotes. Quando a biblioteca disponível para um tema se esgota, o ciclo daquele conjunto é reiniciado automaticamente.

Nesta fase, o painel permite gerar até 14 posts por lote. A biblioteca será ampliada antes de liberar o modo de 30 dias.

## Configuração local

### Backend

```bash
cd server
npm install
npm run dev
```

Não é necessário criar `.env` para testar. A porta padrão é `3001`.

### Frontend

Em outro terminal:

```bash
cd client
npm install
npm run dev
```

O frontend usa `http://localhost:3001` por padrão. Para trocar a URL da API, copie `client/.env.example` para `client/.env` e altere `VITE_API_URL`.

## Endpoints úteis

- `GET /health` — status do motor e tamanho da biblioteca
- `POST /api/generate` — gera um lote de posts
- `GET /api/history` — mostra frases já usadas
- `DELETE /api/history` — zera o histórico local

## Regras de conteúdo

- inglês americano natural (General American)
- português brasileiro natural
- pronúncia escrita de forma legível para brasileiros
- sem IPA ou caracteres fonéticos como `ə`, `ɚ`, `æ`, `ʌ`, `θ`
- CTA curto com referência explícita ao link na bio
- legenda TikTok curta com hashtags relevantes
