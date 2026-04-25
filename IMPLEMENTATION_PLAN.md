# NoelleBot — Implementation Plan

## Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| Module system | CommonJS (`require`) | User preference |
| Test framework | Node.js built-in `node:test` + `node:assert` | Zero dependencies, stable in Node 20+ |
| Logging | `console.log` / `console.error` | Minimal dependencies |
| Error handling | Log error + plain text fallback | Graceful degradation |
| Noelle quotes | Random rotation from a pool | More personality |
| Graceful shutdown | Yes (`SIGTERM`, `SIGINT`) | Required for Docker |
| Linting | ESLint flat config (built-in rules only) | No style plugins needed, minimal deps |

---

## Phase 1: Project Scaffolding

### Step 1.1 — Initialize project

- `npm init -y`
- Set `engines.node` to `>=20.0.0`
- Add scripts: `start`, `dev`, `test`, `lint`

### Step 1.2 — Install dependencies

**Production:**
- `discord.js` — Discord API client
- `dotenv` — Env var loading

**Dev:**
- `eslint` — Linting

### Step 1.3 — Config files

| File | Purpose |
|---|---|
| `.env.example` | Template with placeholder values |
| `.gitignore` | Ignore `node_modules`, `.env`, `dist` |
| `eslint.config.js` | ESLint flat config, CommonJS, Node.js globals |
| `Dockerfile` | Multi-stage Node 20 slim image |
| `docker-compose.yml` | Single service with env_file |

---

## Phase 2: Core Logic (No Discord dependency)

### Step 2.1 — `src/formatter.js`

**Exports:**

```
isUrl(word) → boolean
```
- Returns `true` if word starts with `http://` or `https://`

```
formatCodeLinks(words) → string[]
```
- Filters out URLs, maps remaining words to `https://genshin.hoyoverse.com/en/gift?code={word}`
- Returns array of formatted link strings

```
buildEmbed(links) → EmbedBuilder
```
- Constructs a Discord embed with:
  - Random greeting from pool
  - Links prefixed with 🎁
  - Random footer quote from pool
  - Color `0x80C0A0`

**Internal data:**

```javascript
const GREETINGS = [
  'Welcome back, Traveler! Noelle has prepared your redemption links. Please help yourself! 🧹',
  'Oh, Traveler! I took the liberty of tidying up these codes for you! 🧹',
  'Good day, Traveler! I\'ve organized your gift codes. It\'s the least I can do! ✨',
  'Traveler! Please allow me to assist you with these codes! 💪',
  'Right away, Traveler! Here are your redemption links, freshly prepared! 🍪',
];

const FOOTERS = [
  'As a maid of the Knights of Favonius, it\'s my duty to be of service! 💚',
  'If there\'s anything else you need, please don\'t hesitate to ask! 💚',
  'I hope these are helpful! I\'ll keep doing my best! 💚',
  'No task is too big or too small for Noelle! 💚',
  'Maid of all work, at your service! 💚',
];
```

### Step 2.2 — `src/handler.js`

**Exports:**

```
parseMessage(content) → string[] | null
```
- Splits content by `\n`, trims each line, filters empty lines
- If **every** line is a single word (no spaces) → return array of words
- Otherwise → return `null`

```
handleMessage(message, config) → Promise<void>
```
- Guards: bot author, wrong guild, wrong channel
- Calls `parseMessage` on `message.content`
- Calls `formatCodeLinks` on the words
- If no links → return
- Builds embed, sends to `message.channel`
- On error: logs, attempts plain text fallback

**Parameters:**
- `message` — Discord.js Message object (or mock)
- `config` — `{ guildId, channelId }` for testability (no process.env in logic)

### Step 2.3 — `src/noelle.js` (constants)

- Noelle color, greetings pool, footers pool, embed title
- Keeps all themed content in one place
- Used by `formatter.js`

---

## Phase 3: Discord Client

### Step 3.1 — `src/index.js`

```
1. require('dotenv').config()
2. Validate env vars (DISCORD_TOKEN, GUILD_ID, CHANNEL_ID) — exit with clear error if missing
3. Create Client with intents: Guilds, GuildMessages, MessageContent
4. Register 'ready' event — log "Noelle is ready to serve!"
5. Register 'messageCreate' event — delegate to handleMessage()
6. Register graceful shutdown (SIGTERM, SIGINT):
   - Log shutdown message
   - client.destroy()
   - process.exit(0)
7. client.login(DISCORD_TOKEN)
```

---

## Phase 4: Testing

### Step 4.1 — `test/formatter.test.js`

| Test | Input | Expected |
|---|---|---|
| `isUrl` returns true for http | `'http://example.com'` | `true` |
| `isUrl` returns true for https | `'https://example.com'` | `true` |
| `isUrl` returns false for word | `'GENSHINGIFT'` | `false` |
| `formatCodeLinks` filters URLs | `['ABC', 'https://x.com', 'DEF']` | 2 links |
| `formatCodeLinks` returns empty for all URLs | `['https://a.com']` | `[]` |
| `buildEmbed` returns valid embed | `['link1', 'link2']` | Embed with color, title, description, footer |

### Step 4.2 — `test/handler.test.js`

| Test | Input Content | Expected |
|---|---|---|
| Single code | `'GENSHINGIFT'` | `['GENSHINGIFT']` |
| Multiple codes | `'ABC\nDEF\nGHI'` | `['ABC', 'DEF', 'GHI']` |
| Sentence ignored | `'hello world'` | `null` |
| Mixed sentence + code ignored | `'ABC\nhello world'` | `null` |
| Empty lines filtered | `'ABC\n\nDEF'` | `['ABC', 'DEF']` |
| Only URLs → null response | `'https://example.com'` | words parsed, but no links → no send |
| Bot message ignored | `author.bot = true` | no send |
| Wrong channel ignored | wrong channelId | no send |
| Wrong guild ignored | wrong guildId | no send |
| Error fallback | `channel.send` throws on embed | plain text fallback attempted |

---

## Phase 5: Docker & Deployment

### Step 5.1 — `Dockerfile`

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
USER node
CMD ["node", "src/index.js"]
```

- Slim image, non-root user, production deps only
- Works on ARM (Oracle Cloud Ampere A1)

### Step 5.2 — `docker-compose.yml`

```yaml
services:
  noellebot:
    build: .
    env_file: .env
    restart: unless-stopped
```

---

## Implementation Order

```
1. npm init, install deps, config files    (~10 min)
2. src/noelle.js — constants               (~5 min)
3. src/formatter.js — pure logic           (~15 min)
4. test/formatter.test.js — unit tests     (~10 min)
5. src/handler.js — message processing     (~15 min)
6. test/handler.test.js — unit tests       (~15 min)
7. src/index.js — client wiring            (~10 min)
8. Manual test with real Discord server    (~10 min)
9. Dockerfile + docker-compose.yml         (~5 min)
10. Final lint pass + cleanup               (~5 min)
```

**Total estimated time: ~1.5 hours**

---

## File Dependency Graph

```
src/index.js
  ├── dotenv
  ├── discord.js (Client)
  └── src/handler.js
        ├── src/formatter.js
        │     └── src/noelle.js
        └── src/noelle.js (config only)
```

All business logic is testable without Discord. Only `index.js` touches the real client.
