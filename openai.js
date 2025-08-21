// Please install OpenAI SDK first: `npm install openai`

const OpenAI =require('openai') ;

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-5aaf786676194a7b8c140b5f7ea00f8a'
});

async function main(question) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: question }],
    model: "deepseek-chat",
  });
  return completion.choices[0].message.content;
}

module.exports.main= main;