import React, { useState, useRef, useEffect } from "react";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! I'm your AI assistant for RV University. I can help you with questions about admissions, courses, IQAC, and more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('admission') || message.includes('apply')) {
      return "🎓 Applications are open for UG and PG courses 2025-26! You can apply at rvu.edu.in or call +91 89511 79896. What specific course are you interested in?";
    }
    
    if (message.includes('iqac')) {
      return "📊 IQAC (Internal Quality Assurance Cell) ensures continuous improvement in academic quality. We oversee assessment, accreditation processes, and engage all stakeholders in pursuing excellence. Would you like to know about specific IQAC activities?";
    }
    
    if (message.includes('course') || message.includes('program')) {
      return "🎯 RV University offers various UG and PG programs across Engineering, Management, Arts & Sciences, and more. Visit our admissions page or contact admissions@rvu.edu.in for detailed course information.";
    }
    
    if (message.includes('fee') || message.includes('cost')) {
      return "💰 Fee structure varies by program. For detailed fee information, please contact our admissions office at +91 89511 79896 or email admissions@rvu.edu.in.";
    }
    
    if (message.includes('location') || message.includes('address')) {
      return "📍 RV University is located at RV Vidyanikethan Post, 8th Mile, Mysuru Road, Bengaluru - 560 059, India. We're easily accessible from Bengaluru city.";
    }
    
    if (message.includes('contact') || message.includes('phone')) {
      return "📞 You can reach us at:\n• Phone: +91 89511 79896\n• Email: admissions@rvu.edu.in\n• Website: rvu.edu.in";
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "👋 Hello! Welcome to RV University. I'm here to help you with any questions about our university, admissions, courses, or facilities. What would you like to know?";
    }
    
    if (message.includes('thank')) {
      return "🙏 You're welcome! If you have any more questions about RV University, feel free to ask. Good luck with your academic journey!";
    }
    
    return "🤔 That's a great question! For detailed information, I'd recommend contacting our admissions office at +91 89511 79896 or email admissions@rvu.edu.in. They can provide you with comprehensive assistance. Is there anything specific about RV University I can help you with?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(async () => {
      const response = await getAIResponse(inputValue);
      const botMessage = {
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      fontFamily: 'Arial, sans-serif'
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 8px 25px rgba(0,0,0,0.3), 0 0 20px rgba(213, 171, 93, 0.4); }
          50% { box-shadow: 0 8px 25px rgba(0,0,0,0.3), 0 0 30px rgba(213, 171, 93, 0.6); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Chat Toggle Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #D5AB5D, #FFD700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3), 0 0 20px rgba(213, 171, 93, 0.4)',
          transition: 'all 0.3s ease',
          border: '2px solid rgba(213, 171, 93, 0.6)',
          animation: 'pulse 2s infinite'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.4), 0 0 30px rgba(213, 171, 93, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3), 0 0 20px rgba(213, 171, 93, 0.4)';
        }}
      >
        <span style={{ fontSize: '28px' }}>
          {isOpen ? '✕' : '🤖'}
        </span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '0',
          width: '380px',
          height: '500px',
          background: 'linear-gradient(145deg, rgba(24, 46, 55, 0.95), rgba(16, 30, 39, 0.95))',
          borderRadius: '20px',
          border: '1px solid rgba(213, 171, 93, 0.4)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          backdropFilter: 'blur(15px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Chat Header */}
          <div style={{
            background: 'linear-gradient(135deg, #D5AB5D, #FFD700)',
            padding: '15px 20px',
            borderRadius: '20px 20px 0 0',
            color: '#1A2F37',
            fontWeight: 'bold',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            <span>🤖</span>
            <span>RV University AI Assistant</span>
            <div style={{
              marginLeft: 'auto',
              width: '8px',
              height: '8px',
              background: '#28a745',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#D5AB5D #1A2F37'
          }}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: message.type === 'user' ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
                  background: message.type === 'user' 
                    ? 'linear-gradient(135deg, #D5AB5D, #FFD700)'
                    : 'linear-gradient(145deg, rgba(32, 57, 71, 0.9), rgba(18, 31, 40, 0.9))',
                  color: message.type === 'user' ? '#1A2F37' : '#D5AB5D',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  border: message.type === 'bot' ? '1px solid rgba(213, 171, 93, 0.3)' : 'none',
                  fontWeight: message.type === 'user' ? '500' : '400',
                  whiteSpace: 'pre-line'
                }}
              >
                {message.text}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                maxWidth: '80px',
                padding: '12px 16px',
                borderRadius: '18px 18px 18px 5px',
                background: 'linear-gradient(145deg, rgba(32, 57, 71, 0.9), rgba(18, 31, 40, 0.9))',
                border: '1px solid rgba(213, 171, 93, 0.3)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#D5AB5D',
                    animation: 'bounce 1.5s infinite'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#D5AB5D',
                    animation: 'bounce 1.5s infinite 0.2s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#D5AB5D',
                    animation: 'bounce 1.5s infinite 0.4s'
                  }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid rgba(213, 171, 93, 0.2)',
            background: 'linear-gradient(145deg, rgba(24, 46, 55, 0.8), rgba(16, 30, 39, 0.8))'
          }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about RV University..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid rgba(213, 171, 93, 0.4)',
                  borderRadius: '25px',
                  background: 'rgba(32, 57, 71, 0.8)',
                  color: '#D5AB5D',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#D5AB5D';
                  e.target.style.boxShadow = '0 0 10px rgba(213, 171, 93, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(213, 171, 93, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                style={{
                  width: '45px',
                  height: '45px',
                  border: 'none',
                  borderRadius: '50%',
                  background: inputValue.trim() ? 'linear-gradient(135deg, #D5AB5D, #FFD700)' : 'rgba(213, 171, 93, 0.3)',
                  color: '#1A2F37',
                  cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: inputValue.trim() ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (inputValue.trim()) {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = inputValue.trim() ? '0 4px 12px rgba(0,0,0,0.3)' : 'none';
                }}
              >
                {isTyping ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;