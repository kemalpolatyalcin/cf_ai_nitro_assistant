# Cloudflare AI-NITRO Assistant

A full-stack, serverless AI application built on the Cloudflare ecosystem. This assistant features a persistent memory system and a responsive web interface.

## Features
- **Workers AI:** Integration with Meta Llama 3.3 for high-quality natural language processing.
- **Persistent Memory:** Uses Cloudflare D1 (SQL) to store and retrieve chat history, allowing the AI to remember previous interactions.
- **Serverless Architecture:** Entirely hosted on Cloudflare Workers for global scalability and low latency.
- **Web UI:** A built-in frontend that allows users to interact with the AI directly from their browser.

##  Tech Stack
- **Runtime:** Cloudflare Workers
- **Language:** TypeScript
- **AI Model:** @cf/meta/llama-3-8b-instruct
- **Database:** Cloudflare D1 (Serverless SQL)
- **Tooling:** Wrangler CLI

##  Prerequisites
- Node.js and npm installed
- A Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)

##  Setup and Deployment
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/cloudflare-ainitro-assistant.git](https://github.com/your-username/cloudflare-ainitro-assistant.git)