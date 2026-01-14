import { GoogleGenAI } from "@google/genai";
import { GENAIKEY } from "../env.js"
// The client gets the API key from the environment variable `GEMINI_API_KEY`.

const ai = new GoogleGenAI({
    apiKey: GENAIKEY
});

function sum({ num1, num2 }) {
    return num1 + num2
}

const declareSumFn = {
    name: "sum",
    description: "this function calculate sum of two numbers",
    parameters: {
        type: 'OBJECT',
        properties: {
            num1: {
                type: 'NUMBER',
                description: 'this is first number ex: 3'
            },
            num2: {
                type: 'NUMBER',
                description: 'this is second number ex: 4'
            }
        },
        required: ['num1', 'num2']
    }
}

async function main() {
    const TOOLS = {
        sum,
    }
    const res = TOOLS['sum']
    const r= res({num1:1,num2:3})
    console.log(r)
    // const response = await ai.models.generateContent({
    //     model: "gemini-3-flash-preview",
    //     contents: [{ role: 'user', parts: [{ text: 'what is sum of 1000 and 100' }] }],
    //     config: {
    //         tools: [{
    //             functionDeclarations: [declareSumFn]
    //         }],
    //     }
    // });
    // if (response.functionCalls && response.functionCalls.length > 0) {
    //     const functionCall = response.functionCalls[0]; // Assuming one function call
    //     console.log(`Function to call: ${functionCall.name}`);
    //     console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
    //     // In a real app, you would call your actual function here:
    //     // const result = await getCurrentTemperature(functionCall.args);
    //     const Called = TOOLS[functionCall.name]
    //     const result  = Called(functionCall.args)
    //     console.log(result)
    // } else {
    //     console.log("No function call found in the response.");
    //     console.log(response.text);

    // }
}

main();