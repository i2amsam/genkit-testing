import { gemini15Flash, googleAI } from "@genkit-ai/googleai";
import * as fs from 'fs/promises';
import { genkit, z } from 'genkit';
import { logger } from 'genkit/logging'
import express, { text } from "express";
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { formatDocumentsAsString } from 'langchain/util/document';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { GoogleVertexAIEmbeddings } from '@langchain/community/embeddings/googlevertexai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatPromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts';
import {
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { GenkitTracer } from 'genkitx-langchain';
import { HumanMessage, SystemMessage } from "@langchain/core/messages";


const port = process.env.PORT || 3000;

export const ai = genkit({
  plugins: [googleAI()],
});

logger.setLogLevel('debug')

// const recipiePrompt = ai.definePrompt({
//         name: 'Recipies prompt',
//         model: gemini15Flash,
//         input: {
//             schema: z.object({
//                 photoUrl: z.string(),
//                 userPrompt: z.string(),
//             })
//         },
//         output: {
//             format: 'json',
//             schema: z.object({
//                 recipe: z.string()
//                     .describe("A recipe, starting with a title, in markdown format"),
//                 tags: z.array(z.string())
//                     .describe("Two to Four 1-word keyword tags for the recipe, lowercase only"),
//             })
//         },
//     },
//     `
//     You're an expert chef.  Make sure to follow all instructions.

//     The user has asked 
//     ====
//     {{userPrompt}} 
//     ====

//     and provided this image: 
//     ====
//     {{media url=photoUrl}}
//     ====
//     `
// );

const vectorStore = new MemoryVectorStore(new GoogleVertexAIEmbeddings());

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
});

export const indexPdfFlow = ai.defineFlow(
  { name: 'indexPdf', inputSchema: z.string(), outputSchema: z.void() },
  async (filePath) => {
    const docs = await new PDFLoader(filePath).load();
    vectorStore.addDocuments(docs);
  }
);

const userMessage = new HumanMessage({
  content: [
    {
      type: "image_url",
      image_url: "{photoUrl}",
    },
  ],
});

const userMessageAboutPrompt = HumanMessagePromptTemplate.fromTemplate("this is a template {peanutButter}");

// const userMessageAboutPrompt = new SystemMessage({
//   content: [
//     {
//       type: "text",
//       text: "this is a template {peanutButter} "
//     },
//   ],
// });

const systemMessage = new SystemMessage({
  content: [{
    type: 'text',
    text: 'Answer the question based on the following content {context}'
  }]
})

const prompt = ChatPromptTemplate.fromMessages([
  //systemMessage,
  userMessageAboutPrompt,
  //userMessage,
]);

// const prompt =
//   PromptTemplate.fromTemplate(`Answer the question based only on the following context:
// {context}

// Question: {question}`);

const retriever = vectorStore.asRetriever();

export const recipieWithContextFlow = ai.defineFlow(
  {
    name: 'pdfQA', inputSchema: z.object({
      photoUrl: z.string(),
      userPrompt: z.string(),
    }), outputSchema: z.string()
  },
  async (inputs) => {
    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    return await chain.invoke({
      context: retriever.pipe(formatDocumentsAsString),
      userPrompt: inputs.userPrompt,
      photoUrl: inputs.photoUrl,
    }, 
    { 
      callbacks: [new GenkitTracer()] 
    });
  }
);

async function createServer() {
  const app = express();
  app.use(express.static('static'));
  app.post("/api/generate", express.json(), async (req, res) => {
    const { image, userPrompt } = req.body;
    let imageUrl = `./static/images/${image}`;
    const imageBase64 = await fs.readFile(imageUrl, { encoding: 'base64' });

    const result = await recipieWithContextFlow({
      userPrompt: userPrompt,
      photoUrl: `data:image/jpeg;base64,${imageBase64}`
    });

    return res.send(result);
  });
  app.listen(port);
  console.log("Server started: http://localhost:" + port);
}

//createServer();
console.log("SamSam");
async function checkPrompt() {
  console.log("Formatting prompt");
  const promptFormatted = await prompt.format({
    peanutButter: "samsam",
  });
  console.log(promptFormatted);
}

checkPrompt();
