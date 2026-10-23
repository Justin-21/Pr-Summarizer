# Diffwise

An AI-powered GitHub pull request summarizer built with Next.js, TypeScript, and the Vercel AI SDK. It fetches a pull request and its file diffs from GitHub, then returns a grounded change summary, potential risks, and tailored test suggestions.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install` in this folder.
3. Set `OPENROUTER_API_KEY` in `.env` (or copy `.env.example` to `.env.local`). A `GITHUB_TOKEN` is optional and raises GitHub API rate limits.
4. Run `npm run dev`, then open `http://localhost:3000`.

Only public GitHub pull requests are supported. The app sends the PR title, description, and up to 45,000 characters of patch text to OpenRouter's `openai/gpt-4o-mini` model for analysis. It does not store submitted code.
# Pr-Summarizer
