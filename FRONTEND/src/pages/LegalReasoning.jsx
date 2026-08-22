import React, { useState, useRef, useEffect } from 'react';
import { Scale, AlertCircle } from 'lucide-react';
import WorkspaceContainer from '../components/common/WorkspaceContainer';
import ConversationLayout from '../components/chat/ConversationLayout';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import LegalAnalysisRenderer from '../components/reasoning/LegalAnalysisRenderer';
import { generateReasoning } from '../services/reasoningService';
import { useAuth } from '../contexts/AuthContext';

const LegalReasoningChatArea = ({ refreshConversations }) => {
  const { currentUser } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;
    
    const userMessage = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);
    setError(null);
    
    abortControllerRef.current = new AbortController();
    
    try {
      const token = await currentUser.getIdToken();
      const response = await generateReasoning(
        token,
        userMessage.content, 
        activeConversationId, // pass conversation_id
        abortControllerRef.current.signal
      );
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content,
        citations: response.citations || [],
        id: response.analysis_id
      }]);
      
      // If it's a new conversation, update the active ID and refresh sidebar
      if (!activeConversationId && response.conversation_id) {
        setActiveConversationId(response.conversation_id);
        if (refreshConversations) refreshConversations();
      }
      
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        console.log('Request canceled');
      } else {
        setError(err.message || 'Failed to generate legal reasoning.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputValue('');
    setError(null);
  };

  const handleSelectConversation = (conv) => {
    setActiveConversationId(conv.id);
  };

  const handleMessagesLoaded = (loadedMessages) => {
    // Map backend messages to frontend format if needed
    setMessages(loadedMessages);
  };

  return (
    <ConversationLayout
      featureType="legal_reasoning"
      activeConversationId={activeConversationId}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
      onMessagesLoaded={handleMessagesLoaded}
    >
      <div className="flex flex-col h-full bg-paper relative">
        {/* Header */}
        <header className="h-14 flex items-center px-6 border-b border-paper-rule bg-paper z-10 shrink-0">
          <div className="flex items-center gap-3 md:ml-12">
            <div className="p-1.5 bg-amber-light border border-amber/30 rounded-stamp flex items-center justify-center">
              <Scale className="w-4 h-4 text-amber" />
            </div>
            <div>
              <span className="label-stamp text-ink-fog block">LEGAL STRATEGY</span>
              <h1 className="text-[15px] font-semibold text-ink leading-tight" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>Legal Reasoning</h1>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-paper-warm/30 relative scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-8">
              <div className="w-14 h-14 bg-paper border border-paper-rule rounded-stamp flex items-center justify-center mb-6 shadow-stamp">
                <span className="font-display italic text-[22px] font-bold text-amber" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>⚖</span>
              </div>
              <span className="label-stamp text-ink-fog mb-3">CASE STRATEGY</span>
              <h2 className="text-[26px] font-bold text-ink mb-3 leading-tight" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                Build both sides<br /><span className="italic font-normal">of your case.</span>
              </h2>
              <p className="text-[13px] text-ink-muted mb-8 leading-relaxed">
                Construct arguments, evaluate litigation risk, and analyse statutes. Context is maintained throughout the session.
              </p>
              <div className="flex gap-2 flex-wrap justify-center">
                <button onClick={() => setInputValue("Analyze a potential contract dispute regarding late delivery...")} className="text-[12px] bg-paper hover:bg-paper-warm border border-paper-rule px-4 py-2 rounded-button text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber">Contract Dispute</button>
                <button onClick={() => setInputValue("What are the legal steps for an eviction notice...")} className="text-[12px] bg-paper hover:bg-paper-warm border border-paper-rule px-4 py-2 rounded-button text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber">Eviction Notice</button>
                <button onClick={() => setInputValue("Analyze the new BNS provisions regarding...")} className="text-[12px] bg-paper hover:bg-paper-warm border border-paper-rule px-4 py-2 rounded-button text-ink-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber">BNS Analysis</button>
              </div>
            </div>
          ) : (
            <div className="pb-32">
              {messages.map((msg, idx) => (
                <MessageBubble 
                  key={idx} 
                  message={msg} 
                  renderContent={msg.role === 'assistant' ? (content) => <LegalAnalysisRenderer content={content} /> : null}
                />
              ))}
              
              {isGenerating && (
                <MessageBubble
                  message={{ role: 'assistant', content: '' }}
                  renderContent={() => (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="font-mono text-[11px] text-ink-fog uppercase tracking-wider ml-1">Reasoning...</span>
                    </div>
                  )}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-paper via-paper/90 to-transparent pt-10 pb-6 px-4 md:px-8 z-10 pointer-events-none">
          <div className="max-w-4xl mx-auto w-full pointer-events-auto">
            {error && (
              <div className="mb-4 p-3 bg-error-bg border border-error/30 rounded-card flex items-center gap-2 text-error text-[13px] shadow-stamp">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <ChatInput 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSubmit={handleSendMessage}
              isLoading={isGenerating}
              placeholder="Ask a legal question, request drafting modifications..."
            />
          </div>
        </div>
      </div>
    </ConversationLayout>
  );
};

const LegalReasoning = () => {
  return (
    <WorkspaceContainer>
      <LegalReasoningChatArea />
    </WorkspaceContainer>
  );
};

export default LegalReasoning;
