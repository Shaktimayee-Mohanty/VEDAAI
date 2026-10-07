import {OpenAI} from "openai";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"

});
const models = await openai.models.list();

for await (const model of models) {
    console.log(model.id);
}
export default openai