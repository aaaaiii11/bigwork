import { OpenAI } from 'openai';
// import { useReducer } from 'react';
import { Bubble } from "@ant-design/x";
import { Button, Input, Space,Card } from 'antd';

// const reducer=(state,action)=>{ 
//   switch(action.type){
//     case 'user':{
//       return{
//         ...state,
//         results:[...state.results,{content:action.value,role:'user'}]
//       };
//     }
//     case 'ai':{
//       return{
//         ...state,
//         results:[...state.results,{content:action.value,role:'ai'}]
//       };
//     }
//   }
// }
const App= ()=>{
  const {Search}=Input;
  // const [state,dispatch]=useReducer(reducer,{ results:[],})
  // const { results }= state;
  const messages=[];

  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-5aaf786676194a7b8c140b5f7ea00f8a',
    dangerouslyAllowBrowser: true,
  });
  
  async function main(question) {
    messages.push({"role":'user',"content":question})
    const completion = await openai.chat.completions.create({
      messages:messages,
      model: "deepseek-chat",
      
    });
    messages.push(completion.choices[0].message);
    return completion.choices[0].message.content;
  }

//将用户输入的问题保存起来
  const onsearch = async (value, _e,info) => {
    // dispatch({
    //   type: 'user',
    //   value: value
    // })
    // info = await main(value);
    // dispatch({
    //   type: 'ai',
    //   value: info
    // })
    // console.log(messages)
    info =await main(value);
    console.log(info)
    console.log(messages)
  }

  
  return (
    <>
      <Card style={{ width: 900 }}>
        <Space direction="vertical">
          {messages.map(result => {
            if (result.role === 'assistant') {
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