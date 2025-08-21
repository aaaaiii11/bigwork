import { OpenAI } from 'openai';
import { useReducer } from 'react';
import { Bubble } from "@ant-design/x";
import { Button, Input, Space, Card } from 'antd';

// 正确的 reducer 设计
const chatReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        results: [...state.results, { content: action.payload, role: 'user' }]
      };
    case 'ADD_AI_MESSAGE':
      return {
        ...state,
        results: [...state.results, { content: action.payload, role: 'ai' }]
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

const App = () => {
  const { Search } = Input;
  
  // 初始化 reducer 状态
  const [state, dispatch] = useReducer(chatReducer, {
    results: [],
    loading: false
  });
  
  const { results, loading } = state;

  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-5aaf786676194a7b8c140b5f7ea00f8a',
    dangerouslyAllowBrowser: true,
  });

  async function main(question) {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: question }],
      model: "deepseek-chat",
    });
    return completion.choices[0].message.content;
  }

  const onsearch = async (value, _e, info) => {
    console.log(value);
    
    // 添加用户消息到聊天记录
    dispatch({
      type: 'ADD_USER_MESSAGE',
      payload: value
    });
    
    // 设置加载状态
    dispatch({
      type: 'SET_LOADING',
      payload: true
    });
    
    // 获取 AI 回复
    info = await main(value);
    
    // 取消加载状态并添加 AI 消息
    dispatch({
      type: 'SET_LOADING',
      payload: false
    });
    
    dispatch({
      type: 'ADD_AI_MESSAGE',
      payload: info
    });
  };
  
  console.log(results);

  return (
    <>
      <Card style={{ width: 900 }}>
        <Space direction="vertical">
          {results.map((result, index) => {
            if (result.role === 'ai') {
              return <Bubble key={index} style={{ width: 400 }} placement="start" content={result.content} loading={loading} />
            } else {
              return <Bubble key={index} style={{ width: 400 }} placement="end" content={result.content} />
            }
          })}
        </Space>
      </Card>
      <Search
        placeholder="input search loading with enterButton"
        style={{ width: 200 }}
        onSearch={onsearch}>
      </Search>
    </>
  )
}

export default App;