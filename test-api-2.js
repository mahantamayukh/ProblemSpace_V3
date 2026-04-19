const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: "AIzaSyFakeKeyButWaitImJustTryingToInstantiate" });

console.log("Instantiated:", !!ai);
