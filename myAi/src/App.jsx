import { OpenAI } from 'openai';
import { Bubble, Sender } from "@ant-design/x";
import { DeleteOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { UserOutlined } from '@ant-design/icons';
import { Button, Space, Card, Layout, Menu, Modal, Input, message } from 'antd';
import { useState, useEffect, useRef, } from 'react';
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
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [senderValue, setSenderValue] = useState('');
  const renameRef = useRef('');
  // const [myAbortControll,setMyAbortControll] =useState(null);
  const myAbortControllRef = useRef(null);
  const [items, setItems] = useState([
    {
      key: '1',
      label: '新建对话1',
    },
  ]
);
const menuConfig = (e) => ({
  items: [
    {
      label: '重命名',
      key: 'rename',
      icon: <EditOutlined />,
    },
    {
      label: '删除',
      key: 'delete',
      icon: <DeleteOutlined />,
      danger: true,
    },
  ],
  onClick: menuInfo => {
    menuInfo.domEvent.stopPropagation(); //阻止冒泡
    switch (menuInfo.key) {
      case 'rename':
        handleRename(e.key);
        break;
        case 'delete':
          handleDelect(e.key);
          break;
        }
      },
    });
    
    const myStorage = localStorage;
  
    const storeItems = JSON.parse(myStorage.getItem('items'));
    
    useEffect(() => {
      if (storeItems) {
        setItems(storeItems);
      }
    }, []);
  //首次进入页面获取
  useEffect(() => {
    const setLastKey = () => {
      const conversationKey = myStorage.getItem('lastConversation');
      setConversation(conversationKey);
    }
    setLastKey()
  }, [])

  useEffect(() => {
    const storeMessages = JSON.parse(myStorage.getItem(`${conversation}`));
    if (storeMessages) {
      setMessages(storeMessages);
    } else {
      setMessages([]);
    }
  }, [conversation]);

  const openai = new OpenAI({
    // baseURL: '/moonshot/v1',
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-5aaf786676194a7b8c140b5f7ea00f8a',
    // apiKey:'sk-rVtbsJ5nTvELPpJgovBLzVjTPfx2ja3g4jKwzJ3gZphjwJ9w',
    dangerouslyAllowBrowser: true,
  });
  async function main(question,signal) {
    console.log('📦 控制器实例', myAbortControllRef.current);
console.log('📡 即将传进的 signal', myAbortControllRef.current?.signal);
console.log('📡 signal.aborted', myAbortControllRef.current?.signal.aborted);
    const newMessages = [...messages, { "role": 'user', "content": question }];
    setMessages(newMessages);
    let resluts = '';
    try{
      const completion = await openai.chat.completions.create({
        messages: newMessages,
        // model: "kimi-k2k-0905-preview",
        model: "deepseek-chat",
        stream: true,
        signal,
        
      }
    );
      for await (const part of completion) {
        resluts += part.choices[0].delta.content;
        setMessages([...newMessages, { "role": 'assistant', "content": resluts }]);
        console.log('⏩ 循环检测到 aborted，丢弃后续 chunk');
        if (part.choices[0].finish_reason == 'stop') {
          const newm = [...newMessages, { "role": 'assistant', "content": resluts }];
          myStorage.setItem(`${conversation}`, JSON.stringify([...newm]));
        }
      }
    }catch(err){
      console.log('错误信息',err);
      console.log('🔥 catch 触发', err.name, err.message);
      if(err.name === 'AbortError'){
        console.log('用户中断了输出')
      }
    }finally {
      setLoading(false);   // 不管成功还是中断，都把“转圈”关掉
      
    }
    // return completion.choices[0].message.content;
  }
  //用户点取消发送 (还未完成)
  const onCancel = () => {
    console.log('🛑 abort 之后立即查看', myAbortControllRef.current.signal.aborted);
    if( myAbortControllRef.current ){
      myAbortControllRef.current.abort();
      console.log('中断请求已发送',myAbortControllRef.current);
    }else{
      console.log('没有可中断的请求');
    }
  };
  // //用户点发送
  // const onsearch = async () => {
  //   const ac = new AbortController();
  //   setMyAbortControll(ac);
  //   setLoading(true);
  //   await main(senderValue,ac.signal);
  //   setSenderValue('');
  // }
  const onsearch =async()=>{
    myAbortControllRef.current = new AbortController();
    setLoading(true);
    await main(senderValue,myAbortControllRef.current.signal);
    setSenderValue('');
  }
  //点击添加对话
  const handleOnClick = () => {
    // const maxKey = items.length > 0 ? Math.max(...items.map(item => Number(item.key))) : 0;
    const maxKey = items.reduce((max, item) => Math.max(max, Number(item.key)), 0);
    const newItems = [{ key: `${maxKey + 1}`, label: `新建对话${maxKey + 1}` }, ...items];
    setItems(newItems);
    myStorage.setItem('items', JSON.stringify(newItems));
  }
  //点击左侧对话列表
  const handleClick = (key) => {
    myStorage.setItem('lastConversation', key);
    setConversation(key);
  }
  //点击左侧的功能框| 重命名
  const handleRename = (renameKey) => {
    const myItems = JSON.parse(myStorage.getItem('items'));
    const renameValue = myItems.find(item => { if (item.key == renameKey) { return item } });
    const defaultValue = renameValue ? renameValue : '';
    renameRef.current = defaultValue;
    setIsModalOpen(true);
  }
  //点击左侧的功能框| 删除
  const handleDelect = (delectKey) => {
    myStorage.removeItem(`${delectKey}`);
    const newItems = items.filter(item => item.key !== delectKey);
    setItems(()=>{
      if (delectKey == conversation) {
        const myItems = JSON.parse(myStorage.getItem('items'));
        if (myItems.length > 0) {
          myStorage.setItem('lastConversation', myItems[0].key);
          setConversation(myItems[0].key);
        }
      }
      return newItems;
    });
    
    myStorage.setItem('items', JSON.stringify(newItems));
  }
  return (
    <>
      <Layout style={{ 
        paddingBottom: 120
       }}>
        <Sider theme='light'
          style={{
            overflow: 'auto',
            height: '100vh',
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            scrollbarWidth: 'thin',
            scrollbarGutter: 'stable',
            overFlow: 'auto',
            position: 'fixed',
            left: 0,

          }}>
          <div className='handleAddBox' style={{ padding: '10px 0', textAlign: 'center' }}>
            <Button onClick={handleOnClick} className='handleAdd'>add</Button>
          </div>
          <Conversations items={items} onActiveChange={handleClick} menu={menuConfig} activeKey={conversation || '1'} />
        </Sider>
        <Layout style={{ marginLeft: 200, minHeight: '100vh' }}>
          <Content>
            <Space direction="vertical" >
              {messages.map(message => {
                if (message.role === 'assistant') {
                  return <Bubble style={{ width: 700 }} placement="start" content={message.content} messageRender={renderMarkdown}
                    avatar={{ icon: <UserOutlined />, style: fooAvatar }}
                  />
                } else {
                  return <Bubble style={{ width: 850 }} placement="end" content={message.content}
                    avatar={{ icon: <UserOutlined />, style: barAvatar }}
                  />
                }
              })}
            </Space>
          </Content>

          <Footer style={{
            position: 'fixed',
            bottom: 0,
            width: 'calc(100% - 200px)',  
            textAlign: 'center',
            background: '#f0f2f5',
            zIndex: 999,
          }}>
            <Sender
              onSubmit={onsearch}
              placeholder="请输入内容"
              loading={loading}
              // disabled={loading}
              onCancel={onCancel}
              onChange={(e) => { setSenderValue(e) }}
              value={senderValue}
            >
            </Sender>
          </Footer>
        </Layout>
      </Layout>
      <MyModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setItems={setItems} rename={renameRef.current.label} renameKey={renameRef.current.key} items={items}></MyModal>
    </>
  )
}
//修改名字的组件
const MyModal = ({ isModalOpen, setIsModalOpen, rename, renameKey, items ,setItems}) => {
  const [state, setState] = useState('');
  const [inputState, setInputState] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    if (rename) {
      setState(rename);
    }
  }, [rename])
  const error = () => {
    messageApi.open({
      type: 'error',
      content: '名字不能为空!',
    });
  };
  const handleOk = () => {
    if (state == '') {
      error();  //名字不能为空
      return
    } else {
      const newItems = [...items.map(label => {
        if (label.key == renameKey) {
          return { key: renameKey, label: state };
        }
        return label;
      })];
      setItems(newItems);
      localStorage.setItem('items', JSON.stringify(newItems));
      setIsModalOpen(false);
    }
  }

  const handleChange = (e) => {
    setState(e.target.value);
    if (e.target.value == '') {
      setInputState('error');
    } else {
      setInputState(null);
    }
  }
  const handleCancel = () => {
    setIsModalOpen(false);
  }
  return (
    <>
      <Modal
        title="修改名字"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}>
        {contextHolder}
        <Input value={state} onChange={handleChange} status={inputState} />
      </Modal>
    </>
  )
}

export default App;