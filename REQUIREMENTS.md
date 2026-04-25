# NoelleBot — Requirements Document

## Overview

NoelleBot is a Discord bot themed as **Noelle** from Genshin Impact, serving as a helpful maid. It monitors a specific channel in a specific server and automatically converts redemption codes into clickable Genshin Impact gift links.

---

## Functional Requirements

### FR-1: Channel & Server Configuration

- The bot shall be configurable to monitor **one specific channel** in **one specific server**.
- Server ID and Channel ID shall be stored in environment variables (`GUILD_ID`, `CHANNEL_ID`).
- The bot shall ignore all messages from other servers and channels.

### FR-2: Message Detection

- The bot shall process messages that consist of **single words only**, one per line.
- A message qualifies for processing if **every non-empty line** contains exactly **one word** (no spaces within a line).
- Messages containing normal sentences (multiple words on a single line) shall be **ignored entirely**.
- The bot shall ignore its own messages and messages from other bots.

### FR-3: Code Link Formatting

- For each qualifying word in a detected message, the bot shall generate a link in the format:
  ```
  https://genshin.hoyoverse.com/en/gift?code={word}
  ```
- If a word is already a URL/link (starts with `http://` or `https://`), it shall be **skipped** and not formatted.
- If after filtering out links there are **no words left**, the bot shall not respond.

### FR-4: Response Format

- The bot shall reply in the **same channel** where the message was posted.
- All generated links shall be posted as a **single message**.
- The response shall use a Discord **embed** with:
  - **Color**: Matching Noelle's theme (light mint/green, `#80C0A0`)
  - **Title**: A cheerful maid-themed title (e.g., "✨ Noelle's Redemption Service!")
  - **Description**: A short in-character Noelle message followed by the formatted links
  - **Footer**: An in-character Noelle quote
- Noelle's personality: polite, eager to help, maid-like, slightly formal, wholesome.

### FR-5: Duplicate Handling

- No duplicate detection required. The bot will process every qualifying message regardless of whether the same codes have been posted before.

### FR-6: Message Edit Handling

- The bot shall **not** react to message edits.

---

## Non-Functional Requirements

### NFR-1: Technology Stack

- **Runtime**: Node.js (v20+)
- **Library**: discord.js v14
- **Configuration**: dotenv for environment variables

### NFR-2: Configuration via Environment Variables

| Variable        | Description                          |
|-----------------|--------------------------------------|
| `DISCORD_TOKEN` | Bot authentication token             |
| `GUILD_ID`      | Target server (guild) ID             |
| `CHANNEL_ID`    | Target channel ID                    |

### NFR-3: Project Structure

```
NoelleBot/
├── src/
│   ├── index.js          # Entry point, client setup & login
│   ├── handler.js         # Message processing logic (testable)
│   └── formatter.js       # Link formatting & embed building
├── test/
│   ├── handler.test.js    # Unit tests for message handler
│   └── formatter.test.js  # Unit tests for formatter
├── .env                   # Environment variables (git-ignored)
├── .env.example           # Example env file
├── .gitignore
├── package.json
├── Dockerfile             # For cloud deployment
├── docker-compose.yml
└── REQUIREMENTS.md
```

### NFR-4: Testability

- Core logic (message detection, link formatting) shall be separated from Discord client code.
- Unit tests shall be runnable **without** a Discord connection using mocked message objects.

### NFR-5: Deployment

- The bot shall be deployable via Docker.
- Target deployment: Oracle Cloud Free Tier (ARM-based VM).

---

## Message Processing Flow

```
1. Receive MESSAGE_CREATE event
2. Ignore if:
   a. Message is from a bot
   b. Message is not in the configured guild
   c. Message is not in the configured channel
3. Split message content by newlines
4. Trim each line, filter out empty lines
5. Check: does every line contain exactly one word (no spaces)?
   - No  → Ignore message
   - Yes → Continue
6. For each word:
   - If it looks like a URL → Skip
   - Otherwise → Generate gift link
7. If no links generated → Do nothing
8. Build Noelle-themed embed with all links
9. Send embed to the same channel
```

---

## Example

### Input Message
```
GENSHINGIFT
5SPDKV8ZHBF9
WANVJAFKUZER
```

### Bot Response (Embed)
> **✨ Noelle's Redemption Service!**
>
> Welcome back, Traveler! Noelle has prepared your redemption links. Please help yourself! 🧹
>
> 🎁 https://genshin.hoyoverse.com/en/gift?code=GENSHINGIFT
> 🎁 https://genshin.hoyoverse.com/en/gift?code=5SPDKV8ZHBF9
> 🎁 https://genshin.hoyoverse.com/en/gift?code=WANVJAFKUZER
>
> *As a maid of the Knights of Favonius, it's my duty to be of service!* 💚
