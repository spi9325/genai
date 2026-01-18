import { Pinecone } from '@pinecone-database/pinecone';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { fileURLToPath } from "url";
import path from 'path';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GENAIKEY, PINECONE_INDEX_NAME, PINECONEDBKEY } from '../env.js'
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenAI } from '@google/genai';
import { question } from 'readline-sync';

// loading the pdf=====================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({apiKey:GENAIKEY});

async function main() {

    const pdfPath = path.join(__dirname, "sanketinamdar.pdf");
    const question = 'what technical skills present in my resume.'

    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 })
    const chunks = await splitter.splitDocuments(docs);

    //  langchain google emmbedings

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: `${GENAIKEY}`,
        model: "text-embedding-004", // 768 dimensions
    });

    // Pinecone instance

    const pinecone = new Pinecone({
        apiKey: `${PINECONEDBKEY}`
    });
    const pineconeIndex = pinecone.Index('sanket');

    // store documents
    // await PineconeStore.fromDocuments(chunks, embeddings, {
    //     pineconeIndex,
    //     maxConcurrency: 5,
    // });

    // console.log("success")

    const queryVector = await query(embeddings,question)
    const context = await get_ansof_userQuestion(queryVector, pinecone, pineconeIndex)
    aiLLM(context,question)
}

main();





//functions





async function query(embeddings,question) {
    const queryVector = await embeddings.embedQuery(question);
    return queryVector;
}

async function get_ansof_userQuestion(queryVector, pinecone, pineconeIndex) {
    const searchResults = await pineconeIndex.query({
        topK: 3,
        vector: queryVector,
        includeMetadata: true,
    });


    const context = searchResults.matches
        .map(match => match.metadata.text)
        .join("\n\n---\n\n");
    return context;

}

async function aiLLM(context,question) {
   
    const History = []

    History.push({
        role: 'user',
        parts: [{ text: question }]
    })



    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: History,
        config: {
            systemInstruction: `You have to behave like a resume reviewer o find insides from resume and answer user according to their questions.
            you must answer acording to provided context only. dont get answer outside of context or see outside documents or other things only see context.
      Context: ${context}
      `,
        },
    });


    History.push({
        role: 'model',
        parts: [{ text: response.text }]
    })

    console.log("\n");
    console.log(response.text);
}