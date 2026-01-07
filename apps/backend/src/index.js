
import axios from "axios"
import * as cheerio from 'cheerio'
import OpenAI from "openai";
import { GENAIKEY } from "../env.js";
import { ChromaClient } from "chromadb";

const client = new OpenAI({
    apiKey: GENAIKEY,
    baseURL: "https://api.groq.com/openai/v1",
    
});

const WEB_COLLECTION = `WEB_SCRAPED_DATA_COLLECTION-1`

const chromaClient = new ChromaClient({path:"http://localhost:8000"})
chromaClient.heartbeat();
// const response = await client.responses.create({
//     model: "openai/gpt-oss-20b",
//     input: "yes",
// });
// const response = await client.chat.completions.create({
//     model: "openai/gpt-oss-20b",
//     messages:[{role:'user' , content:"my name is sanket so translate this in marathi"}]
// }).then((e)=>{
//     console.log(e.choices[0].message.content)
// })

function chunkByWords(text, tokenSize) {
  if (!text || tokenSize <= 0) return [];

  const tokens = text.trim().split(/\s+/);
  const chunks = [];

  for (let i = 0; i < tokens.length; i += tokenSize) {
    chunks.push(tokens.slice(i, i + tokenSize).join(" "));
  }

  return chunks;
}

async function scrape(url){
    const {data} = await axios.get(url)
    const allData = cheerio.load(data);

    const head = allData('head').html();
    const body = allData('body').html();
    const internalLink = [];
    allData("a").each((_,el)=>{
        
        const link = allData(el).attr("href")
        if(link !== "/"){
            internalLink.push(link)
        }
        console.log(internalLink)
    })

    return {head,body,internalLink}
}   


async function generateVectorEmbeddings({url,text}){
    const embedding = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
    })
    return embedding.data[0].embedding
}

async function insertIntoDb({embedding,url}){
    
}

async function ingest(url){
    const { head, body, internalLink } = await scrape(url);
    const headEmbedding = await generateVectorEmbeddings({text: head})
    const bodyChunk = chunkText(body,2000)
    const bodyEmbedding = await generateVectorEmbeddings({text: body})
}

ingest("https://www.10mindesigns.shop");