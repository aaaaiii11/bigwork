import { UserOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import { Typography } from 'antd';
import markdownit from 'markdown-it';
import React from 'react';

const md = markdownit({ html: true, breaks: true });
const text = `
> Render as markdown content to show rich text!

Link: [Ant Design X](https://x.ant.design)
`.trim();
const renderMarkdown = content => {
  return (
    <Typography>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
      <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </Typography>
  );
};
const App = () => {
  const [renderKey, setRenderKey] = React.useState(0);
  React.useEffect(() => {
    const id = setTimeout(
      () => {
        setRenderKey(prev => prev + 1);
      },
      text.length * 100 + 2000,
    );
    return () => {
      clearTimeout(id);
    };
  }, [renderKey]);
  return (
    <div style={{ height: 100 }} key={renderKey}>
      <Bubble
        
        content={text}
        messageRender={renderMarkdown}
        avatar={{ icon: <UserOutlined /> }}
      />
    </div>
  );
};
export default App;
// MarkdownRenderer.jsx
// import { UserOutlined } from '@ant-design/icons';
// import { Bubble } from '@ant-design/x';
// import { Typography } from 'antd';
// import markdownit from 'markdown-it';
// import React from 'react';

// const md = markdownit({ html: true, breaks: true });

// const renderMarkdown = (content) => {
//   return (
//     <Typography>
//       {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
//       <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
//     </Typography>
//   );
// };

// const MarkdownRenderer = ({ text, showBubble = true }) => {
//   // 确保text是字符串类型并处理默认值
//   const content = text && typeof text === 'string' ? text.trim() : '';
  
//   if (showBubble) {
//     return (
//       <div style={{ height: 100 }}>
//         <Bubble
//           typing
//           content={content}
//           messageRender={renderMarkdown}
//           avatar={{ icon: <UserOutlined /> }}
//         />
//       </div>
//     );
//   }
  
//   // 如果不需要气泡样式，直接渲染markdown
//   return renderMarkdown(content);
// };

// export default MarkdownRenderer;

// React.useEffect(() => {
//     const delay = Math.max(1000, text?.length * 100 || 0) + 2000;
//     const id = setTimeout(() => {
//       setRenderKey(prev => prev + 1);
//     }, delay);
    
//     return () => {
//       clearTimeout(id);
//     };
//   }, [renderKey, text]);