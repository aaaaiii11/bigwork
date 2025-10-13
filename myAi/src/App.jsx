import { OpenAI } from 'openai';
import { Bubble, Sender } from "@ant-design/x";
import { UserOutlined } from '@ant-design/icons';
import { Button, Space, Card, Layout, Menu, } from 'antd';
import { useState } from 'react';
import MarkdownIt from 'markdown-it';
import { Conversations } from '@ant-design/x';

const { Header, Footer, Content, Sider } = Layout;
const fooAvatar = {
  color: '#f56a00',
  backgroundColor: '#fde3cf',
};
const barAvatar = {
  color: '#fff',
  backgroundColor: '#87d068',
};

const md = new MarkdownIt({ html: true, breaks: true });
const renderMarkdown = content => {
  return (
    <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
  )
}
const App = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState(false);
  const [items, setItems] = useState([
    {
      key:'1',
      label: '新建对话1',
    },
    ]);
  const openai = new OpenAI({
    // baseURL: '/moonshot/v1',
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-5aaf786676194a7b8c140b5f7ea00f8a',
    // apiKey:'sk-rVtbsJ5nTvELPpJgovBLzVjTPfx2ja3g4jKwzJ3gZphjwJ9w',
    dangerouslyAllowBrowser: true,
  });

  async function main(question) {
    const newMessages = [...messages, { "role": 'user', "content": question }];
    setMessages(newMessages);
    let resluts = '';

    const completion = await openai.chat.completions.create({
      messages: newMessages,
      // model: "kimi-k2k-0905-preview",
      model: "deepseek-chat",
      stream: true,

    });
    for await (const part of completion) {
      resluts += part.choices[0].delta.content;
      setMessages([...newMessages, { "role": 'assistant', "content": resluts }]);
      if (state) {
        break;
      }
    }
    setState(false);
    setLoading(false);
    console.log(messages);

    return completion.choices[0].message.content;
  }
  //用户点取消发送  (还未完成)
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

  //点击添加对话
  const handleOnClick = () => {
    setItems([...items,{key:`${items.length+1}`,label:`新建对话${items.length+1}`}]);
    console.log(items);
  }
  return (
    <>
      <Layout>
        <Sider theme='light' style={{
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          scrollbarWidth: 'thin',
          scrollbarGutter: 'stable',
        }}>
          <div className='handleAddBox' style={{padding:'10px 0',textAlign:'center'}}>
          <Button onClick={handleOnClick} className='handleAdd'>add</Button>
          </div>
          <Conversations items={items} onClick={(e) => { console.log(e)}}  defaultActiveKey="1"></Conversations>
        </Sider>
        <Layout>
        <Content>
          <Space direction="vertical" >
            {messages.map(message => {
              if (message.role === 'assistant') {
                return <Bubble style={{ width: 700 }} placement="start" typing content={message.content} messageRender={renderMarkdown}
                  avatar={{ icon: <UserOutlined />, style: fooAvatar }}
                />
              } else {
                return <Bubble style={{ width: 850 }} placement="end" content={message.content}
                  avatar={{ icon: <UserOutlined />, style: barAvatar }} />
              }
            })}
          </Space>
          </Content>

          <Footer>
            <Sender onSubmit={onsearch}
              placeholder="请输入内容"
              loading={loading}
              onCancel={onCancel}
            >
            </Sender>
          </Footer>
        </Layout>
      </Layout>

    </>
  )
}


export default App;