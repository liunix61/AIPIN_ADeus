import { AnimatePresence, motion } from 'framer-motion';
import ChatDots from './ChatDots';
import MarkdownIt from 'markdown-it';
import tm from 'markdown-it-texmath';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // You can choose other styles as well
import 'katex/dist/katex.min.css';

export interface Message {
  role: string;
  content: string;
}

const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlightedCode = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        // Replace the default class with a custom class
        const modifiedCode = highlightedCode.replace(/<span class="hljs-strong">/g, '<span class="hljs-strong-custom">');
        return '<pre class="code-block"><code>' +
               modifiedCode +
               '</code></pre>';
      } catch (__) {}
    }
  }
});

// Add a custom CSS rule for the modified class
if (typeof document !== 'undefined') {
  const customCss = document.createElement('style');
  customCss.innerHTML = `
    .hljs-strong-custom {
      color: white;
      font-weight: normal;
    }
  `;
  document.head.appendChild(customCss);
}

// Use markdown-it-texmath with KaTeX
md.use(tm, { engine: require('katex'), delimiters: 'dollars', katexOptions: { macros: { "\\RR": "\\mathbb{R}" } } });

export default function ChatLog({
  messages,
  waitingForResponse,
}: {
  messages: Message[];
  waitingForResponse: boolean;
}) {
  const renderMessageContent = (content: string) => {
    const html = md.render(content);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <AnimatePresence initial={false}>
      {messages ? (
        <ol className="pb-4">
          {messages.map((chat, index) => (
            <div
              key={index}
              className={
                chat['role'] == 'user'
                  ? 'flex w-full items-end justify-end'
                  : ''
              }
            >
              <motion.div
                className={
                  chat['role'] == 'user'
                    ? 'bg-primary mb-2 w-fit rounded-xl rounded-br-none px-4 py-3 shadow-sm'
                    : 'bg-muted/20 mb-2 w-fit rounded-xl rounded-bl-none px-4 py-3 shadow-sm'
                }
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 1 } }}
              >
                {renderMessageContent(chat['content'])}
              </motion.div>
            </div>
          ))}
          {waitingForResponse ? (
            <motion.div
              className="bg-muted/20 mb-2 w-fit rounded-xl rounded-bl-none px-4 py-3 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 1 } }}
            >
              <ChatDots />
            </motion.div>
          ) : null}
        </ol>
      ) : null}
    </AnimatePresence>
  );
}
