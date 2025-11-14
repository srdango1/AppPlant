import React, { useState } from 'react';

// URL del backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'bot', text: '¡Hola! Soy PlantCare. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading || !input.trim()) return;

        const userMessage = { from: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Llama al nuevo endpoint /chat del backend
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error en la respuesta del bot');
            }

            const data = await response.json();
            const botMessage = { from: 'bot', text: data.reply };
            setMessages(prev => [...prev, botMessage]);

            // Si el backend nos avisa que se creó un cultivo, disparamos el evento
            if (data.action_performed === 'create') {
                window.dispatchEvent(new CustomEvent('cultivoActualizado'));
            }

        } catch (error) {
            console.error('Error al contactar al chatbot:', error);
            const errorMessage = { from: 'bot', text: `Lo siento, tuve un error: ${error.message}` };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Estilos (CSS en línea para simplicidad, puedes moverlos a tu CSS)
    const chatBubbleStyle = {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '4rem',
        height: '4rem',
        borderRadius: '50%',
        backgroundColor: 'rgb(7, 136, 39)', // Color primario
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
    };

    const chatWindowStyle = {
        position: 'fixed',
        bottom: '7rem',
        right: '2rem',
        width: '370px',
        height: '500px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
        zIndex: 1000,
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #eee',
    };

    const headerStyle = {
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderBottom: '1px solid #eee',
    };

    const messagesContainerStyle = {
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        color: '#333',
    };

    const messageStyle = (from) => ({
        padding: '0.5rem 1rem',
        borderRadius: '18px',
        maxWidth: '80%',
        alignSelf: from === 'bot' ? 'flex-start' : 'flex-end',
        backgroundColor: from === 'bot' ? '#f0f0f0' : 'rgb(7, 136, 39)', // Color primario
        color: from === 'bot' ? '#333' : 'white',
    });

    const formStyle = {
        display: 'flex',
        padding: '1rem',
        borderTop: '1px solid #eee',
    };

    return (
        <>
            {/* La ventana del chat */}
            <div style={chatWindowStyle}>
                <div style={headerStyle}>
                    <h3 style={{ margin: 0, color: '#333', fontWeight: '600' }}>Chat PlantCare</h3>
                </div>
                
                <div style={messagesContainerStyle}>
                    {messages.map((msg, index) => (
                        <div key={index} style={messageStyle(msg.from)}>
                            {msg.text}
                        </div>
                    ))}
                    {isLoading && (
                        <div style={messageStyle('bot')}>...</div>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        style={{ flex: 1, border: '1px solid #ddd', borderRadius: '18px', padding: '0.75rem', marginRight: '0.5rem' }}
                    />
                    <button type="submit" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.5rem' }}>
                        <span className="material-symbols-outlined" style={{color: 'rgb(7, 136, 39)'}}>send</span>
                    </button>
                </form>
            </div>

            {/* La burbuja para abrir/cerrar */}
            <div style={chatBubbleStyle} onClick={toggleChat}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>
                    {isOpen ? 'close' : 'chat'}
                </span>
            </div>
        </>
    );
}

export default ChatBot;