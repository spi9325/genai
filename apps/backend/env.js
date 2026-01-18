import { config } from "dotenv";

config();

export const GENAIKEY = process.env.GENAIKEY2
export const PINECONEDBKEY = process.env.PINECONEDBKEY
export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME