import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCheck, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { startFormSession, sendFormAnswer, downloadPdf, downloadDocx } from '../services/formFillerService';

interface FormQuestion {
  id: string;
  fieldKey: string;
  question: string;
  explanation: string;
  placeholder: string;
  example: string;
}

interface FormTemplateConfig {
  id: string;
  name: string;
  category: string;
  actReference: string;
  authority: string;
  questions: FormQuestion[];
  initialFields: Record<string, string>;
  generateFormText: (fields: Record<string, string>) => string;
}

// Keep the UI rendering config here, but the backend drives the flow
const FORM_TEMPLATES: FormTemplateConfig[] = [
  {
    id: 'RTI_FORM_A',
    name: 'RTI Application Form A (Section 6(1))',
    category: 'RTI & Transparency',
    actReference: 'Right to Information Act, 2005 (Act No. 22 of 2005)',
    authority: 'Public Information Officer (PIO) / Concerned Central or State Public Authority',
    initialFields: {
      APPLICANT_NAME: '',
      APPLICANT_ADDRESS: '',
      APPLICANT_CONTACT: '',
      PUBLIC_AUTHORITY: '',
      PERIOD_OF_INFO: '',
      SPECIFIC_QUESTIONS: '',
      FEE_PAYMENT_MODE: ''
    },
    questions: [
      {
        id: 'q1',
        fieldKey: 'APPLICANT_NAME',
        question: 'What is your full legal name as it appears on your government ID?',
        explanation: 'Under Section 6(1) of the RTI Act, any citizen of India is entitled to file an application.',
        placeholder: 'e.g. Aarav Sharma',
        example: 'Aarav Sharma'
      },
      {
        id: 'q2',
        fieldKey: 'APPLICANT_ADDRESS',
        question: 'What postal address should the Public Information Officer mail the certified records to?',
        explanation: 'India Post will deliver the official reply packet to this residential or office address.',
        placeholder: 'e.g. House 14, Pocket B, Mayur Vihar Phase 2, New Delhi - 110091',
        example: 'House 14, Pocket B, Mayur Vihar Phase 2, New Delhi - 110091'
      },
      {
        id: 'q3',
        fieldKey: 'PUBLIC_AUTHORITY',
        question: 'Which government department, ministry, or civic body holds the records you need?',
        explanation: 'Specifying the exact PIO or department prevents inter-departmental transfer delays under Section 6(3).',
        placeholder: 'e.g. Public Information Officer, Municipal Corporation of Delhi',
        example: 'Public Information Officer, Municipal Corporation of Delhi, Civic Centre, New Delhi'
      },
      {
        id: 'q4',
        fieldKey: 'SPECIFIC_QUESTIONS',
        question: 'What specific public information or certified documents are you requesting? (Number them clearly)',
        explanation: 'Keep questions objective and focused on certified records, tender files, inspection memos, or ledger entries.',
        placeholder: '1. Certified copy of...\n2. Total expenditure on...',
        example: '1. Certified copy of tender sanction order for Road Repair Project No. CR-2024/88.\n2. Asphalt thickness test report.\n3. Contractor payment vouchers.'
      },
      {
        id: 'q5',
        fieldKey: 'FEE_PAYMENT_MODE',
        question: 'How are you submitting the mandatory ₹10 application fee?',
        explanation: 'Central and State rules require a nominal ₹10 fee (exempted for BPL ration card holders).',
        placeholder: 'e.g. Indian Postal Order (IPO) of ₹10 enclosed / Paid online',
        example: 'Indian Postal Order (IPO) No. 45F 892019 for ₹10/- attached'
      }
    ],
    generateFormText: (fields) => `FORM 'A'
APPLICATION FOR SEEKING INFORMATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

To,
The Public Information Officer (PIO),
${fields.PUBLIC_AUTHORITY || '[PUBLIC AUTHORITY / DEPARTMENT]'}

1. FULL NAME OF THE APPLICANT:
   ${fields.APPLICANT_NAME || '[APPLICANT FULL NAME]'}

2. ADDRESS FOR CORRESPONDENCE:
   ${fields.APPLICANT_ADDRESS || '[APPLICANT MAILING ADDRESS]'}
   Contact Phone / Email: ${fields.APPLICANT_CONTACT || '[PHONE / EMAIL]'}

3. CITIZENSHIP STATUS:
   The Applicant is a Citizen of the Republic of India.

4. DETAILS OF INFORMATION SOUGHT UNDER SECTION 6(1):
   Period to which the information relates: ${fields.PERIOD_OF_INFO || 'Current Financial Year'}

   SPECIFIC PARTICULARS OF INFORMATION REQUESTED:
${fields.SPECIFIC_QUESTIONS || '   1. Certified copy of relevant public records and sanction orders.'}

5. WHETHER INFORMATION IS SOUGHT BY POST OR IN PERSON:
   By Registered / Speed Post to the address mentioned in paragraph 2 above.

6. DETAILS OF APPLICATION FEE PAID PURSUANT TO SECTION 6(1):
   ${fields.FEE_PAYMENT_MODE || 'Indian Postal Order (IPO) of ₹10/- attached herewith.'}

7. STATUTORY MANDATE:
   As mandated under Section 7(1) of the RTI Act 2005, the requested information may kindly be furnished within thirty (30) calendar days from receipt of this application.

DECLARATION:
I hereby declare that the particulars furnished above are true to the best of my knowledge and that I am a citizen of India.

Place: _________________________
Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

____________________________________
(Signature of the Applicant)`
  },
  {
    id: 'CONSUMER_COMPLAINT_EDAIL',
    name: 'Consumer Commission Grievance Petition (CPA 2019 / e-Daakhil)',
    category: 'Consumer Protection',
    actReference: 'Consumer Protection Act, 2019 (Act No. 35 of 2019)',
    authority: 'District Consumer Disputes Redressal Commission (DCDRC)',
    initialFields: {
      APPLICANT_NAME: '',
      APPLICANT_ADDRESS: '',
      APPLICANT_CONTACT: '',
      OPPOSITE_PARTY: '',
      PRODUCT_DETAILS: '',
      PURCHASE_PRICE: '',
      DEFECT_DESCRIPTION: '',
      RELIEF_PRAYER: ''
    },
    questions: [
      {
        id: 'qc1',
        fieldKey: 'APPLICANT_NAME',
        question: 'Who is the consumer who purchased the defective product or service?',
        explanation: 'The complainant must be the person who paid consideration or the beneficiary under Section 2(7).',
        placeholder: 'e.g. Priya Mehra',
        example: 'Priya Mehra'
      },
      {
        id: 'qc2',
        fieldKey: 'OPPOSITE_PARTY',
        question: 'Who is the seller, e-commerce platform, or manufacturer you are claiming against?',
        explanation: 'Both the retailer and manufacturer share product liability under Section 84 of CPA 2019.',
        placeholder: 'e.g. Retailer Store Pvt Ltd & Manufacturer Ltd',
        example: 'ElectroRetail India Private Limited & Apex Tech Electronics Ltd.'
      },
      {
        id: 'qc3',
        fieldKey: 'PRODUCT_DETAILS',
        question: 'What product or service did you purchase, including invoice date and amount paid?',
        explanation: 'State invoice number, price paid, and warranty coverage period.',
        placeholder: 'e.g. Laptop Model XYZ bought on 10 Oct for ₹48,000',
        example: 'Smart 4K Ultra HD Television 55-inch (Model: AT-55X, Invoice No: BLR-89201, ₹54,999/-)'
      },
      {
        id: 'qc4',
        fieldKey: 'DEFECT_DESCRIPTION',
        question: 'What defect occurred, and what unfair refusal did you receive from the opposite party?',
        explanation: 'Explain the malfunction and how the seller/service center failed to honor warranty.',
        placeholder: 'e.g. Device stopped working after 2 months; dealer refused repair...',
        example: 'Screen panel blackout within 2 months; authorized dealer wrongfully denied warranty.'
      },
      {
        id: 'qc5',
        fieldKey: 'RELIEF_PRAYER',
        question: 'What monetary refund, replacement, or compensation amount are you demanding?',
        explanation: 'You can demand full purchase refund + interest + compensation for mental agony under Section 39.',
        placeholder: 'e.g. Full refund of ₹54,999 + ₹25,000 compensation',
        example: '1. Full refund of ₹54,999 with 12% interest\n2. ₹25,000 compensation for mental agony\n3. ₹5,000 legal costs.'
      }
    ],
    generateFormText: (fields) => `BEFORE THE HON'BLE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION
(UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019)

CONSUMER COMPLAINT NO. ________ / 2026

IN THE MATTER OF:
${fields.APPLICANT_NAME || '[COMPLAINANT NAME]'}
Residing at: ${fields.APPLICANT_ADDRESS || '[COMPLAINANT ADDRESS]'}
Contact: ${fields.APPLICANT_CONTACT || '[PHONE / EMAIL]'}
... COMPLAINANT

VERSUS

${fields.OPPOSITE_PARTY || '[OPPOSITE PARTY SELLER & MANUFACTURER]'}
... OPPOSITE PARTIES

COMPLAINT UNDER SECTION 35 FOR DEFICIENCY IN SERVICE AND UNFAIR TRADE PRACTICE

MOST RESPECTFULLY SHOWETH:
1. That the Complainant is a bonafide consumer under Section 2(7) of the Consumer Protection Act, 2019.
2. That on date of purchase, Complainant purchased:
   ${fields.PRODUCT_DETAILS || '[PRODUCT & INVOICE DETAILS]'}
   for a total consideration of: ${fields.PURCHASE_PRICE || '[PURCHASE PRICE]'}.
3. CAUSE OF ACTION & DEFICIENCY:
   ${fields.DEFECT_DESCRIPTION || '[DEFECT & UNFAIR TRADE PRACTICE DETAILS]'}
4. That despite statutory demand notice, the Opposite Parties have failed and neglected to rectify the deficiency.
5. JURISDICTION & LIMITATION:
   This Hon'ble Commission has territorial jurisdiction under Section 34 as Complainant resides within this district. The complaint is filed well within the 2-year limitation window under Section 69.

PRAYER:
Wherefore, the Complainant respectfully prays that this Hon'ble Commission may be pleased to direct the Opposite Parties to:
${fields.RELIEF_PRAYER || '1. Refund the full purchase amount with interest;\n2. Pay compensation for mental agony and litigation costs.'}

VERIFICATION:
Verified at Bengaluru on this ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} that the contents of paragraphs 1 to 5 are true to my knowledge.

____________________________________
(Signature of the Complainant)`
  },
  {
    id: 'GRATUITY_FORM_I',
    name: 'Statutory Gratuity Claim (Form I under Rule 7(1))',
    category: 'Workplace & Labour',
    actReference: 'Payment of Gratuity Act, 1972 & Central Rules, 1972',
    authority: 'Controlling Authority / Labour Commissioner',
    initialFields: {
      APPLICANT_NAME: '',
      APPLICANT_ADDRESS: '',
      APPLICANT_CONTACT: '',
      EMPLOYER_NAME: '',
      EMPLOYER_ADDRESS: '',
      TENURE_DATES: '',
      LAST_DRAWN_WAGES: '',
      GRATUITY_CALCULATED_AMOUNT: '',
      BANK_ACCOUNT_DETAILS: ''
    },
    questions: [
      {
        id: 'qg1',
        fieldKey: 'APPLICANT_NAME',
        question: 'What is the full name of the employee claiming statutory gratuity?',
        explanation: 'Form I is the statutory application for gratuity submitted to the employer under Rule 7.',
        placeholder: 'e.g. Vikram Sengupta',
        example: 'Vikram Sengupta'
      },
      {
        id: 'qg2',
        fieldKey: 'EMPLOYER_NAME',
        question: 'What is the registered company name and office address of your former employer?',
        explanation: 'Include company headquarters or local branch where you were stationed.',
        placeholder: 'e.g. Apex Solutions Pvt Ltd, Sector 29 Gurugram',
        example: 'Apex Solutions Private Limited, Cyber Park, Sector 29, Gurugram, Haryana'
      },
      {
        id: 'qg3',
        fieldKey: 'TENURE_DATES',
        question: 'What was your date of joining and your official last working day?',
        explanation: 'Continuous service of 5+ years (rendered as 4 yrs 240 days) entitles full gratuity.',
        placeholder: 'e.g. 1 June 2018 to 31 Jan 2025 (6 years 7 months)',
        example: 'Joined 1st June 2018, Resigned 31st Jan 2025 (6 Years 7 Months)'
      },
      {
        id: 'qg4',
        fieldKey: 'GRATUITY_CALCULATED_AMOUNT',
        question: 'What is your last drawn Basic+DA salary and calculated gratuity amount?',
        explanation: 'Formula under Section 4(2): (Last Basic + DA / 26) * 15 * Completed Years.',
        placeholder: 'e.g. Basic ₹55k, Total Gratuity ₹2,37,980/-',
        example: 'Last Basic+DA ₹75,000/mo → Gratuity Claim ₹2,37,980/-'
      },
      {
        id: 'qg5',
        fieldKey: 'BANK_ACCOUNT_DETAILS',
        question: 'What bank account number and IFSC code should gratuity be wired to?',
        explanation: 'Employer is mandated under Section 7(3) to wire funds within 30 days of application.',
        placeholder: 'e.g. HDFC Bank, A/C 50100..., IFSC: HDFC0001234',
        example: 'HDFC Bank, A/C: 50100293849102, IFSC: HDFC0001234'
      }
    ],
    generateFormText: (fields) => `FORM 'I'
[SEE SUB-RULE (1) OF RULE 7 OF THE PAYMENT OF GRATUITY (CENTRAL) RULES, 1972]
APPLICATION FOR GRATUITY BY AN EMPLOYEE

To,
The Employer / Head of Human Resources,
${fields.EMPLOYER_NAME || '[EMPLOYER COMPANY NAME]'}
${fields.EMPLOYER_ADDRESS || '[EMPLOYER REGISTERED ADDRESS]'}

Sir / Madam,

I, ${fields.APPLICANT_NAME || '[EMPLOYEE NAME]'}, beg to apply for payment of gratuity to which I am entitled under sub-section (1) of section 4 of the Payment of Gratuity Act, 1972 on account of my resignation after completion of continuous service of not less than five years.

1. NAME IN FULL: ${fields.APPLICANT_NAME || '[EMPLOYEE NAME]'}
2. ADDRESS FOR CORRESPONDENCE: ${fields.APPLICANT_ADDRESS || '[EMPLOYEE RESIDENTIAL ADDRESS]'}
3. DEPARTMENT / BRANCH / ESTABLISHMENT: Corporate Division
4. DATE OF APPOINTMENT & LAST WORKING DAY:
   ${fields.TENURE_DATES || '[APPOINTMENT & RESIGNATION DATES]'}
5. TOTAL PERIOD OF CONTINUOUS SERVICE: Completed tenure exceeding 5 statutory years.
6. AMOUNT OF LAST DRAWN WAGES (BASIC + DA):
   ${fields.LAST_DRAWN_WAGES || '[LAST DRAWN BASIC + DA]'}
7. TOTAL AMOUNT OF STATUTORY GRATUITY CLAIMED:
   ${fields.GRATUITY_CALCULATED_AMOUNT || '[TOTAL GRATUITY CLAIM AMOUNT]'}
8. SETTLEMENT BANK ACCOUNT DETAILS:
   ${fields.BANK_ACCOUNT_DETAILS || '[BANK ACCOUNT & IFSC]'}

NOTICE OF STATUTORY COMPLIANCE:
Under Section 7(3) of the Payment of Gratuity Act, 1972, the Employer is legally bound to arrange payment within thirty (30) days from the date it becomes payable. Failure to disburse within the statutory period attracts mandatory compound interest at 10% per annum under Section 7(3A).

Place: _________________________
Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

____________________________________
(Signature / Thumb Impression of the Employee)`
  }
];

export const ConversationalFormFiller: React.FC = () => {
  const { currentUser } = useAuth();
  const token = currentUser ? (currentUser as any).accessToken : null;

  const [selectedFormId, setSelectedFormId] = useState<string>('RTI_FORM_A');
  const activeTemplate = FORM_TEMPLATES.find(f => f.id === selectedFormId) || FORM_TEMPLATES[0];

  const [formFields, setFormFields] = useState<Record<string, string>>(activeTemplate.initialFields);
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('STARTING'); // STARTING, IN_PROGRESS, COMPLETE, ERROR
  const [inputVal, setInputVal] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string; time: string }>>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAiThinking]);

  // Reset and initialize session whenever form changes
  useEffect(() => {
    let isMounted = true;
    
    const initSession = async () => {
      setStatus('STARTING');
      setFormFields(activeTemplate.initialFields);
      setChatMessages([]);
      setCurrentFieldId(null);
      setIsAiThinking(true);
      
      try {
        const data = await startFormSession(token, selectedFormId);
        if (isMounted) {
          setCurrentFieldId(data.current_field);
          setStatus(data.status);
          setChatMessages([{
            role: 'assistant',
            content: data.ai_response,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      } catch (err) {
        if (isMounted) {
          setStatus('ERROR');
          setChatMessages([{
            role: 'assistant',
            content: "I'm sorry, I couldn't connect to the server. Please try refreshing or selecting the form again.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      } finally {
        if (isMounted) {
          setIsAiThinking(false);
        }
      }
    };

    initSession();
    
    return () => {
      isMounted = false;
    };
  }, [selectedFormId, token, activeTemplate.initialFields]);

  // Find current question object for rendering placeholders
  const currentQ = activeTemplate.questions.find(q => q.fieldKey === currentFieldId);
  const completedCount = Object.keys(formFields).filter(k => formFields[k].trim() !== '').length;
  const totalQuestions = activeTemplate.questions.length;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isAiThinking || status === 'COMPLETE') return;

    const userText = inputVal.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const newMessage = { role: 'user', content: userText, time: timeStr };
    const updatedMessages = [...chatMessages, newMessage];
    
    setChatMessages(updatedMessages);
    setInputVal('');
    setIsAiThinking(true);

    try {
      // Backend handles validation and single source of truth for the form structure
      const data = await sendFormAnswer(token, {
        form_id: selectedFormId,
        collected_fields: formFields,
        user_answer: userText,
        history: updatedMessages.map(m => ({ role: m.role, content: m.content }))
      });
      
      setFormFields(data.collected_fields);
      setCurrentFieldId(data.current_field);
      setStatus(data.status);
      
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.ai_response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Something went wrong while processing that answer. Please try sending it again.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleUseExample = (exampleText: string) => {
    setInputVal(exampleText);
  };

  const handleCopyForm = () => {
    const text = activeTemplate.generateFormText(formFields);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = activeTemplate.generateFormText(formFields);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTemplate.id}_Official_Filing.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    try {
      const text = activeTemplate.generateFormText(formFields);
      const blob = await downloadPdf(token, text);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTemplate.id}_Official_Filing.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadDocx = async () => {
    try {
      const text = activeTemplate.generateFormText(formFields);
      const blob = await downloadDocx(token, text);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTemplate.id}_Official_Filing.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download DOCX:', err);
      alert('Failed to generate DOCX. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="bg-[#FAF7F2] border border-[#E4DFD5] rounded-xl p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-[#F2EFE9] text-xs font-mono text-[#8C271E] font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C84B31]" />
            <span>CONVERSATIONAL FORM-FILLER AGENT</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#121820]">
            Guided Intake & Live Auto-Form Generator
          </h1>
          <p className="text-sm text-[#556377] mt-1">
            Answer simple plain-language questions and watch the official government & court form populate in real time.
          </p>
        </div>

        {/* Template Selector Dropdown */}
        <div className="shrink-0 flex items-center space-x-3">
          <label className="text-xs font-mono text-[#556377]">Target Form:</label>
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            disabled={isAiThinking || status === 'STARTING'}
            className="px-3.5 py-2 rounded-lg bg-white border border-[#D5CEC2] text-xs font-mono text-[#121820] font-bold focus:outline-none focus:ring-2 focus:ring-[#121820] shadow-xs disabled:opacity-50"
          >
            {FORM_TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Conversational AI Intake Officer (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white border border-[#E4DFD5] rounded-xl shadow-xs overflow-hidden h-[620px]">
          {/* Interview Officer Header */}
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E4DFD5] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#121820] text-white flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#FAF7F2]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#121820]">
                  AI Legal Intake Officer
                </h3>
                <span className="text-[11px] font-mono text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Interactive Q&A Active
                </span>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-[#556377]">
              <span>{completedCount} of {totalQuestions} required fields completed</span>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF7F2]/40 text-xs scroll-smooth">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#121820] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-[#FAF7F2]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#121820] text-white rounded-tr-none'
                      : 'bg-white border border-[#E4DFD5] text-[#475467] shadow-xs rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <span
                    className={`block text-[10px] font-mono mt-1 ${
                      msg.role === 'user' ? 'text-white/60 text-right' : 'text-[#A2B1C6]'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#C84B31] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
            
            {isAiThinking && (
               <div className="flex items-start gap-2.5 justify-start">
                  <div className="w-6 h-6 rounded-full bg-[#121820] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-[#FAF7F2]" />
                  </div>
                  <div className="max-w-[85%] rounded-xl p-3 bg-white border border-[#E4DFD5] shadow-xs rounded-tl-none flex items-center space-x-1">
                     <span className="w-1.5 h-1.5 bg-[#A2B1C6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                     <span className="w-1.5 h-1.5 bg-[#A2B1C6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                     <span className="w-1.5 h-1.5 bg-[#A2B1C6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
               </div>
            )}
          </div>

          {/* Interactive Question Input Box */}
          <div className="p-3.5 bg-white border-t border-[#E4DFD5]">
            {currentQ && status === 'IN_PROGRESS' && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#556377] mb-1">
                  <span>Tip: {currentQ.explanation}</span>
                  {currentQ.example && (
                    <button
                      type="button"
                      onClick={() => handleUseExample(currentQ.example)}
                      className="text-[#C84B31] hover:underline font-bold disabled:opacity-50"
                      disabled={isAiThinking}
                    >
                      Use sample text
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={status === 'COMPLETE' ? 'Form complete' : (currentQ ? currentQ.placeholder : 'Type your answer...')}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                disabled={isAiThinking || status === 'COMPLETE' || status === 'STARTING'}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#D5CEC2] focus:outline-none focus:ring-1 focus:ring-[#121820] bg-[#FAF7F2] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isAiThinking || status === 'COMPLETE' || status === 'STARTING'}
                className="p-2 rounded-lg bg-[#121820] text-white hover:bg-[#2B3542] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Submit answer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Auto-Populating Legal Form Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white border border-[#E4DFD5] rounded-xl shadow-xs overflow-hidden h-[620px]">
          {/* Document Header Controls */}
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E4DFD5] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#556377] block">
                Official Statutory Form Preview
              </span>
              <h3 className="font-serif font-bold text-sm text-[#121820]">
                {activeTemplate.name}
              </h3>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyForm}
                className="px-3 py-1.5 rounded-md bg-white border border-[#D5CEC2] text-xs font-mono text-[#121820] hover:bg-[#FAF7F2] transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#556377]" />}
                <span>{isCopied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="px-3 py-1.5 rounded-md bg-white border border-[#D5CEC2] text-xs font-mono text-[#121820] hover:bg-[#FAF7F2] transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                <span>PDF</span>
              </button>

              <button
                onClick={handleDownloadDocx}
                className="px-3 py-1.5 rounded-md bg-white border border-[#D5CEC2] text-xs font-mono text-[#121820] hover:bg-[#FAF7F2] transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>DOCX</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 rounded-md bg-white border border-[#D5CEC2] text-xs font-mono text-[#121820] hover:bg-[#FAF7F2] transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#556377]" />
                <span>TXT</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-md bg-[#121820] text-white text-xs font-mono hover:bg-[#2B3542] transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* High-Fidelity Paper Canvas */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#FAF7F2]">
            <div className="max-w-2xl mx-auto bg-white p-8 border border-[#E4DFD5] shadow-xs rounded-sm font-mono text-xs text-[#121820] leading-relaxed whitespace-pre-wrap selection:bg-amber-100">
              {activeTemplate.generateFormText(formFields)}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="p-3 bg-[#FAF7F2] border-t border-[#E4DFD5] text-[11px] font-mono text-[#556377] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grounded in Indian Central/State Gazette Rules</span>
            </span>
            <span>Target Authority: <strong>{activeTemplate.authority.split('/')[0]}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
