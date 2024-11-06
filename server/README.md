# Baking with Genkit Gemini Server

# Instructions

### Start the Genkit Server first

1. `cd server/`
2. Install dependencies with `npm i`
3. Set your Google GenAI API key environment variable in `idx/dev.nix`
`GOOGLE_GENAI_API_KEY = "<your api key>";`
4. Start the flow server with `npx tsx --watch src/index.ts`


### Start the Vite frontend next
1. `cd client`
2. Install dependencies with `npm i`
3. Start the frontend with `npm run dev`
