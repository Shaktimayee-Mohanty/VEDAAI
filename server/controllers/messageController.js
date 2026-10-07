import Chat from "../models/Chat.js"
import User from "../models/User.js"
import openai from "../configs/openai.js"

import axios from "axios"
import imagekit from "../configs/imageKit.js"
//Text-based AI chat mesaages Controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id

        //Check credits
        if (req.user.credits < 1) {
            return res.json({ success: false, message: "You dont have enough credits to use the feature" })
        }

        const { chatId, prompt } = req.body

        const chat = await Chat.findOne({ userId, _id: chatId })
        chat.messages.push({
            role: "user", content: prompt, timestamp: Date.now(),
            isImage: false
        })
        const { choices } = await openai.chat.completions.create({
            model: "gemini-3.1-flash-lite",
            messages: [

                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false }
        res.json({ success: true, reply })

        chat.messages.push(reply)
        await chat.save()
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } })
    } catch (error) {
        console.log("AI ERROR:", error)
        res.json({
            success: false,
            message: error.message
        })
    }

}

//image generation message controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        if (req.user.credits < 2) {
            return res.json({ success: false, message: "You dont have enough credits to use the feature" })
        }
        const { prompt, chatId, isPublished } = req.body
        //Find chat
        const chat = await Chat.findOne({ userId, _id: chatId })

        //push user message
        chat.messages.push({
            role: "user", content: prompt, timestamp: Date.now(),
            isImage: false
        })

        //encode thhe prompt
        const encodedprompt = encodeURIComponent(prompt)

        //Construct imagekit ai generation url
        const generateImageURL = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedprompt}/VedaAI/${Date.now()}.png?tr=w-800,h-800`;

        //trigger generation by fetching from imagekit
        let aiImageResponse;

        for (let i = 0; i < 10; i++) {
            aiImageResponse = await axios.get(generateImageURL, {
                responseType: "arraybuffer"
            })

           

            if (aiImageResponse.headers["content-type"]?.startsWith("image/")) {
                break
            }

            await new Promise(resolve => setTimeout(resolve, 5000))
        }

        if (!aiImageResponse.headers["content-type"]?.startsWith("image/")) {
            throw new Error("Image generation timed out")
        }

        //Convert to base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`;

        //upload to Imagekit media library 

        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "VedaAI"
        })
        console.log("IMAGE URL:", uploadResponse.url)
        const reply = {
            role: 'assistant',
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        }
        res.json({ success: true, reply })

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}