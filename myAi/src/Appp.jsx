import { OpenAI } from 'openai';
import { useState,useReducer, useEffect } from 'react';
import { Bubble } from "@ant-design/x";

import { Button, Input, Space,Card } from 'antd';

function reducer(state,action){
    switch(action.type){
        case 'user':{
            return{
                name:'user',
                user:action.value
            }
        }
        case 'ai':{
            return{
                name:'ai',
                aiResult:action.result
            }
        }
        default:
            return state;
    }
}

const App= ()=>{
  const {Search}=Input;
  const [state, dispatch] = useReducer(reducer, { name: '', aiResult: '', user: '' });

  const [loading ,setLoading]=useState(false)
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

    const onsearch = async (value) => {
      setLoading(true)
        console.log(value);
        dispatch({
          type:'user',
          user:value
        })
        console.log(state.value);
        const info = await main(value);
        setLoading(false);
        if(!loading){
          dispatch({
            type:'ai',
            aiResult:info
          })
          console.log(state.aiResult)
        }
    }
  
  return (
    <>
      <Card style={{ width: 900 }}>
        <Space direction="vertical">
          <Bubble content={state.user}></Bubble>
          <Bubble content={state.aiResult}></Bubble>
        </Space>
      </Card>
      <Search
        placeholder="input search loading with enterButton"
        style={{ width: 200 }}
        onSearch={onsearch} >
      </Search>
    </>
  )
}

export default App;