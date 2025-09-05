import { OpenAI } from 'openai';
import { Bubble } from "@ant-design/x";
import { UserOutlined } from '@ant-design/icons';
import { Button, Input, Space,Card} from 'antd';
import { useState,useEffect,useRef }from 'react';
import MarkdownIt from 'markdown-it';

const fooAvatar = {
  color: '#f56a00',
  backgroundColor: '#fde3cf',
};
const barAvatar = {
  color: '#fff',
  backgroundColor: '#87d068',
};

const md= new MarkdownIt({ html: true, breaks: true });
const renderMarkdown= content=>{
  return(
    <div dangerouslySetInnerHTML={{__html:md.render(content)}}/>
  )
}
const App= ()=>{
  const {Search}=Input;
  const text=useRef(0)
  const [loading,setLoading]=useState(false);
  const [messages,setMessages]=useState([]);
  const [time,setTime]=useState(0);
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
    text.current=completion.choices[0].message.content;
    setLoading(loading=>!loading);
    return completion.choices[0].message.content;
  }

  useEffect(() => {
    const id = setTimeout(
      () => {
        setTime(prev => prev + 1);
      }
      , text.current.length * 100 + 2000
    );
    return () => {
      clearTimeout(id);
    }
  }, [time])

//将用户输入的问题保存起来
  const onsearch = async (value) => {
    setLoading(loading=>!loading);
    await main(value);
  }

  return (
    <>
      <Card style={{ width: 900 }}>
        <Space direction="vertical">
          {messages.map(message => {
            if (message.role === 'assistant') {
              return <Bubble style={{ width: 700 }} placement="start" loading={loading} typing content={message.content} messageRender={renderMarkdown}
              avatar={{ icon: <UserOutlined />, style: fooAvatar }}
              />
            } else {
              return <Bubble style={{ width: 850 }} placement="end" content={message.content} 
              avatar={{ icon: <UserOutlined />, style: barAvatar }}/>
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