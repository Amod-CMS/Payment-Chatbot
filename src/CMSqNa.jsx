// import React, { useState } from 'react';
// import axios from 'axios';
// import './App.css';

// function CMS() {
//     const [messages, setMessages] = useState([]);
//     const [input, setInput] = useState('');

//     // useEffect(() => {
//     //     const updateIndex = async () => {
//     //         try {
//     //             const res = await axios.post('http://localhost:5000/update', {
//     //                 method:'POST'
//     //             });
//     //             const data = await res.json();
//     //             console.log(data);
//     //         } catch (error) {
//     //             console.error('Error updating the index', error);
//     //             setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Error updating the index' }]);
//     //         }
//     //     };

//     //     updateIndex();
//     // }, []); // Empty dependency array ensures this runs only once when the component mounts

//     const sendMessage = async (message) => {
//         const newMessages = [...messages, { sender: 'user', text: message }];
//         setMessages(newMessages);
//         setInput('');

//         try {
//             const res = await axios.post('http://localhost:5000/query', { query: message });
//             setMessages([...newMessages, { sender: 'bot', text: res.data.answer }]);
//         } catch (error) {
//             console.error('Error querying the server', error);
//             setMessages([...newMessages, { sender: 'bot', text: 'Error querying the server' }]);
//         }
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (input.trim()) {
//             sendMessage(input.trim());
//         }
//     };

//     return (
//         <div className="App">
//             <header className="App-header">
//                 <h1>CMS Ai</h1>
//                 <div className="chat-window">
//                     <p className='chat-message bot'>Hello! I'm here to help you out.</p>
//                     {messages.map((msg, index) => (
//                         <div key={index} className={`chat-message ${msg.sender}`}>
//                             {msg.text}
//                         </div>
//                     ))}
//                 </div>
//                 <form onSubmit={handleSubmit} className="chat-input-form">
//                     <input
//                         type="text"
//                         value={input}
//                         onChange={(e) => setInput(e.target.value)}
//                         placeholder="Type your message"
//                     />
//                     <button type="submit">Send</button>
//                 </form>
//             </header>
//         </div>
//     );
// }

// export default CMS;


import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function CMS() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const sendMessage = async (message) => {
        const newMessages = [...messages, { sender: 'user', text: message }];
        setMessages(newMessages);
        setInput('');

        try {
            const res = await axios.post('http://localhost:5000/invoke_agent', { prompt: message });
            setMessages([...newMessages, { sender: 'bot', text: res.data.response }]);
        } catch (error) {
            console.error('Error querying the server', error);
            setMessages([...newMessages, { sender: 'bot', text: 'Error querying the server' }]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input.trim());
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>CMS Ai</h1>
                <div className="chat-window">
                    <p className='chat-message bot'>Hello! I'm here to help you out.</p>
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="chat-input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message"
                    />
                    <button type="submit">Send</button>
                </form>
            </header>
        </div>
    );
}

export default CMS;
