import React, { useState, useRef, useEffect } from 'react';
import { FileText, AlertCircle, UploadCloud, FileUp } from 'lucide-react';
import WorkspaceContainer from '../components/common/WorkspaceContainer';
import ConversationLayout from '../components/chat/ConversationLayout';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import UploadChatRenderer from '../components/uploadChat/UploadChatRenderer';
import { uploadDocument, queryDocument } from '../services/uploadChatService';
import { useAuth } from '../contexts/AuthContext';

const UploadChatArea = ({ refreshConversations }) => {
  const { currentUser } = useAuth();
  
  // File Upload State
  const [file, setFile] = useState(null);
  const [documentMetadata, setDocumentMetadata] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Chat State
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState(null);
  
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setUploadError("Only PDF and DOCX files are supported.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds the 10MB limit.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const token = await currentUser.getIdToken();
      const response = await uploadDocument(token, file);
      setDocumentMetadata(response);
      
      // Clear current chat when a new document is uploaded
      setActiveConversationId(null);
      setMessages([]);
    } catch (err) {
      setUploadError(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating || !documentMetadata) return;
    
    const userMessage = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);
    setChatError(null);
    
    abortControllerRef.current = new AbortController();
    
    try {
      const token = await currentUser.getIdToken();
      const response = await queryDocument(
        token, 
        documentMetadata.document_id, 
        userMessage.content, 
        activeConversationId, 
        abortControllerRef.current.signal
      );
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: JSON.stringify(response)
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
        setChatError(err.message || "Failed to get an answer.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputValue('');
    setChatError(null);
    setDocumentMetadata(null); // Return to upload screen
    setFile(null);
  };

  const handleSelectConversation = (conv) => {
    setActiveConversationId(conv.id);
    if (conv.document_id) {
      setDocumentMetadata({
        document_id: conv.document_id,
        filename: conv.document?.filename || "Previously Uploaded Document",
        pages: conv.document?.pages || "?",
        summary: conv.document?.summary || "Loaded from history."
      });
    }
  };

  const handleMessagesLoaded = (loadedMessages) => {
    setMessages(loadedMessages);
  };

  return (
    <ConversationLayout
      featureType="upload_chat"
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
              <FileUp className="w-4 h-4 text-amber" />
            </div>
            <div>
              <span className="label-stamp text-ink-fog block">DOCUMENT ANALYSIS</span>
              <h1 className="text-[15px] font-semibold text-ink leading-tight" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                {documentMetadata ? documentMetadata.filename : 'Document Chat'}
              </h1>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-paper-warm/30 relative scroll-smooth">
          {!documentMetadata ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="bg-paper border-2 border-dashed border-paper-rule rounded-card p-10 max-w-lg w-full text-center hover:border-amber/40 transition-colors shadow-stamp">
                <div className="w-14 h-14 bg-amber-light border border-amber/30 rounded-stamp flex items-center justify-center mx-auto mb-6">
                  <UploadCloud className="w-7 h-7 text-amber" />
                </div>
                <span className="label-stamp text-ink-fog block mb-3">DOCUMENT UPLOAD</span>
                <h2 className="text-[26px] font-bold text-ink mb-3 leading-tight" style={{ fontFamily: 'Newsreader, Georgia, serif' }}>
                  Upload a document.<br /><span className="italic font-normal">Ask it anything.</span>
                </h2>
                <p className="text-[13px] text-ink-muted mb-8 leading-relaxed">
                  PDF or DOCX up to 10MB. Extract insights, summarize clauses, and identify red flags.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row justify-center gap-3 mb-5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-6 py-2.5 bg-paper-warm border border-paper-rule text-ink rounded-button hover:border-paper-border font-medium text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber"
                  >
                    Select File
                  </button>

                  {file && (
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-6 py-2.5 bg-ink text-paper rounded-button hover:bg-ink-soft font-semibold text-[14px] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-stamp focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber"
                    >
                      {uploading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload & Parse"
                      )}
                    </button>
                  )}
                </div>

                {file && !uploading && (
                  <p className="font-mono text-[11px] font-medium text-amber bg-amber-light inline-block px-3 py-1 rounded-stamp border border-amber/30">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}

                {uploadError && (
                  <p className="text-error text-[13px] mt-4 bg-error-bg py-2 px-3 rounded-card inline-block border border-error/30">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="pb-32">
              {messages.map((msg, idx) => (
                <MessageBubble 
                  key={idx} 
                  message={msg} 
                  renderContent={msg.role === 'assistant' ? (content) => <UploadChatRenderer content={content} /> : null}
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
                      <span className="font-mono text-[11px] text-ink-fog uppercase tracking-wider ml-1">Analysing...</span>
                    </div>
                  )}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area (Only visible when document is uploaded) */}
        {documentMetadata && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-paper via-paper/90 to-transparent pt-10 pb-6 px-4 md:px-8 z-10 pointer-events-none">
            <div className="max-w-4xl mx-auto w-full pointer-events-auto">
              {chatError && (
                <div className="mb-4 p-3 bg-error-bg border border-error/30 rounded-card flex items-center gap-2 text-error text-[13px] shadow-stamp">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {chatError}
                </div>
              )}
              <ChatInput 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onSubmit={handleSendMessage}
                isLoading={isGenerating}
                placeholder="Ask a question about this document..."
              />
            </div>
          </div>
        )}
      </div>
    </ConversationLayout>
  );
};

const UploadChat = () => {
  return (
    <WorkspaceContainer>
      <UploadChatArea />
    </WorkspaceContainer>
  );
};

export default UploadChat;
