import { OpenAI } from 'openai';
import { Bubble } from "@ant-design/x";
import { Button, Input, Space,Card } from 'antd';
import { useState }from 'react';

const App= ()=>{
  const {Search}=Input;
  const [messages,setMessages]=useState([]);
  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-5aaf786676194a7b8c140b5f7ea00f8a',
    dangerouslyAllowBrowser: true,
  });
  
  async function main(question) {
    const newMessages = [...messages,{"role":'user',"content":question}];
    setMessages(newMessages);
    const completion = await openai.chat.completions.create({
      messages:newMessages,
      model: "deepseek-chat",
    });
    setMessages([...newMessages,completion.choices[0].message]);
    return completion.choices[0].message.content;
  }

//将用户输入的问题保存起来
  const onsearch = async (value) => {
   await main(value);
    console.log(messages)
  }

  return (
    <>
      <Card style={{ width: 900 }}>
        <Space direction="vertical">
          {messages.map(message => {
            if (message.role === 'assistant') {
              return <Bubble style={{ width: 400 }} placement="start" content={message.content}  />
            } else {
              return <Bubble style={{ width: 400 }} placement="end" content={message.content} />
            }
          })}
        </Space>
      </Card>
      <Search
        placeholder="input search loading with enterButton"
        style={{ width: 200 }}
        onSearch={onsearch}
        >
      </Search>
    </>
  )
}

export default App;