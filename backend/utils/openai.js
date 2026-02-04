import 'dotenv/config';

const getOpenAIResponse = async (message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        })
    };

    try {
        const response = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            options
        );

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        }

        return "No response from AI";
    } catch (err) {
        console.error("AI Request Error:", err);
        throw new Error(`AI Request Failed: ${err.message}`);
    }
};

export default getOpenAIResponse;
