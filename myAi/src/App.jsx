import { OpenAI } from 'openai';
import { useReducer } from 'react';
import { Bubble } from "@ant-design/x";
import { Button, Input, Space,Card } from 'antd';

const reducer=(state,action)=>{ 
  switch(action.type){
    case 'user':{
      return{
        ...state,
        results:[...state.results,{content:action.value,role:'user'}]
      };
    }
    case 'ai':{
      return{
        ...state,
        results:[...state.results,{content:action.value,role:'ai'}]
      };
    }
  }
}
const App= ()=>{
  const {Search}=Input;
  const [state,dispatch]=useReducer(reducer,{ results:[],})
  const { results }= state;
  const messages=state.results;

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
    dispatch({
      type: 'user',
      value: value
    })
    if(messages.length!==0){
      value=messages;
    }
    console.log(results);
    info = await main(value);
    console.log(`用户提的问题是${value}`)
    dispatch({
      type: 'ai',
      value: info
    })
  }

  
  return (
    <>
      <Card style={{ width: 900 }}>
        <Space direction="vertical">
          {results.map(result => {
            if (result.role === 'ai') {
              return <Bubble style={{ width: 400 }} placement="start" content={result.content}  />
            } else {
              return <Bubble style={{ width: 400 }} placement="end" content={result.content} />
            }
          })}
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