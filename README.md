# NoelleBot 🧹

A Noelle-themed Discord bot that automatically converts Genshin Impact redemption codes into clickable gift links.

When someone posts codes in a monitored channel, Noelle responds with formatted redemption links in a cute embed — just like a maid of the Knights of Favonius would!

---

## Features

- 🎁 Detects redemption codes posted as single words (one per line)
- 🔗 Converts them into clickable `hoyoverse.com/gift` links
- 💚 Responds with a Noelle-themed embed with rotating quotes
- 🚫 Ignores normal messages, sentences, bots, and existing URLs

## Example

**Someone posts:**
```
GENSHINGIFT
5SPDKV8ZHBF9
WANVJAFKUZER
```

**Noelle responds with an embed:**
> ✨ **Noelle's Redemption Service!**
>
> Welcome back, Traveler! Noelle has prepared your redemption links. Please help yourself! 🧹
>
> 🎁 https://genshin.hoyoverse.com/en/gift?code=GENSHINGIFT
> 🎁 https://genshin.hoyoverse.com/en/gift?code=5SPDKV8ZHBF9
> 🎁 https://genshin.hoyoverse.com/en/gift?code=WANVJAFKUZER
>
> *As a maid of the Knights of Favonius, it's my duty to be of service!* 💚

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- A Discord account

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/NoelleBot.git
cd NoelleBot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** → name it `NoelleBot` → click **Create**
3. Go to the **Bot** tab (left sidebar)
4. Click **"Reset Token"** → copy the token (you'll need this in step 5)
5. Scroll down to **Privileged Gateway Intents** and enable:
   - ✅ **Message Content Intent**

### 4. Invite the bot to your server

Click the link below to add NoelleBot to your server:

👉 **[Invite NoelleBot](https://discord.com/oauth2/authorize?client_id=1497525628210253824&permissions=84992&integration_type=0&scope=bot)**

Select your server and click **Authorize**.

### 5. Get your Server ID and Channel ID

1. Open Discord → **User Settings** → **Advanced** → enable **Developer Mode**
2. Right-click your **server name** → **Copy Server ID**
3. Right-click the **channel** you want the bot to monitor → **Copy Channel ID**

### 6. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```properties
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_server_id_here
CHANNEL_ID=your_channel_id_here
```

### 7. Start the bot

```bash
npm start
```

You should see:

```
[NoelleBot] Noelle is ready to serve! Logged in as NoelleBot#1234
[NoelleBot] Monitoring guild: 123456789, channel: 987654321
```

---

## Development

### Run with auto-reload

```bash
npm run dev
```

### Run tests

```bash
npm test
```

### Run linter

```bash
npm run lint
```

---

## Docker Deployment

Build and run with Docker Compose:

```bash
docker compose up --build -d
```

Or with Docker directly:

```bash
docker build -t noellebot .
docker run -d --env-file .env --restart unless-stopped --name noellebot noellebot
```

---

## Project Structure

```
NoelleBot/
├── src/
│   ├── index.js        # Entry point — client setup, login, shutdown
│   ├── handler.js      # Message detection & processing logic
│   ├── formatter.js    # Link formatting & embed building
│   └── noelle.js       # Themed constants (colors, quotes, greetings)
├── test/
│   ├── handler.test.js
│   └── formatter.test.js
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## License

MIT
