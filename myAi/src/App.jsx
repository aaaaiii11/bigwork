import { OpenAI } from 'openai';
import { Bubble,Sender } from "@ant-design/x";
import { UserOutlined } from '@ant-design/icons';
import { Button, Space,Card} from 'antd';
import { useState }from 'react';
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
  const [messages,setMessages]=useState([]);
  const [loading,setLoading]=useState(false);
  const [state,setState]=useState(false);

  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-5aaf786676194a7b8c140b5f7ea00f8a',
    dangerouslyAllowBrowser: true,
  });

  async function main(question) {
    const newMessages = [...messages,{"role":'user',"content":question}];
    setMessages(newMessages);
    let resluts='';

    const completion = await openai.chat.completions.create({
      messages:newMessages,
      model: "deepseek-chat",
      stream: true,
      
    });
      for await (const part of completion){
        resluts+=part.choices[0].delta.content;
        setMessages([...newMessages, {"role": 'assistant', "content": resluts}]);
        if(state){
          break;
        }
      }
    setState(false);
    setLoading(false);
    // return completion.choices[0].message.content;
  }
  //用户点取消发送  
  const onCancel = () => {
  const ac = new AbortController();
  const { signal } = ac;
    fetch('https://api.deepseek.com', { signal: signal });
  };  


  const onsearch = async (value) => {
    console.log(value);
    setLoading(true);
    await main(value);

  }

  return (
    <>
      <Card style={{ width: 900 }}>
        <Space direction="vertical">
          {messages.map(message => {
            if (message.role === 'assistant') {
              return <Bubble style={{ width: 700 }} placement="start"  typing content={message.content} messageRender={renderMarkdown}
              avatar={{ icon: <UserOutlined />, style: fooAvatar }}
              />
            } else {
              return <Bubble style={{ width: 850 }} placement="end" content={message.content} 
              avatar={{ icon: <UserOutlined />, style: barAvatar }}/>
            }
          })}
        </Space>
      </Card>
         <Sender onSubmit={onsearch}
            autoSize={{ minRows: 2, maxRows: 1 }}
            loading={loading}
            onCancel={onCancel}
         > 
         </Sender>
    </>
  )
}

export default App;