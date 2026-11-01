import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'agent';
  senderName?: string;
  text: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  lastReply: string;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'faq'>('chat');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null);

  // Tickets list for Support 2.0
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '#PD-2026-9041',
      category: '2.0 Progression',
      subject: '1.0 Level Conversion & Paula Drop Compensation Package',
      status: 'RESOLVED',
      priority: 'HIGH',
      createdAt: 'Today, 09:20 AM',
      lastReply: 'Compensation bundle verified & credited to Paula ID Firestore save.',
    },
    {
      id: '#PD-2026-8812',
      category: 'Network & Netcode',
      subject: 'Error 42 Desync during Showdown Poison Gas shrink',
      status: 'INVESTIGATING',
      priority: 'NORMAL',
      createdAt: 'Yesterday, 04:15 PM',
      lastReply: 'Engineering team reviewing simulated UDP tick sync logs.',
    },
  ]);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      senderName: 'Otto 2.0 Support Bot',
      text: 'Welcome to Paula Drops Player Support 2.0! I am Bot Otto. How can our automated triage help you with Paula Drops 2.0, your 1.0 progression compensation, or Paula ID today?',
      timestamp: 'Just now',
    },
  ]);

  if (!isOpen) return null;

  const quickTopics = [
    {
      id: 'comp',
      title: '🎁 2.0 Compensation Help',
      prompt: 'How is my 1.0 level compensation calculated in Paula Drops 2.0?',
      reply:
        'In Paula Drops 2.0, every level you earned across your Brawlers in 1.0 is converted into 220 Coins, 12 Gems, 150 Bling, and high-tier Paula Drops (Mythic & Legendary!). You can claim or re-inspect your compensation at any time via the 2.0 Update banner or through the Dev Console.',
    },
    {
      id: 'paula_id',
      title: '🛡️ Paula ID & Cloud Sync',
      prompt: 'How do I ensure my 2.0 progress is backed up with Google?',
      reply:
        'Open the top-right profile drawer in the Lobby and click "Sign in with Google (Paula ID)". Your entire account progression (Trophies, Gold, Gems, Brawler Power Levels, and Compensation Status) is mirrored in real-time to Google Firebase Firestore.',
    },
    {
      id: 'hypercharge',
      title: '⚡ Hypercharge 2.0 Mechanics',
      prompt: 'What changed with Hypercharge in the 2.0 update?',
      reply:
        'Hypercharge 2.0 now grants an active neon energy aura ring, +25% movement speed, +30% attack damage, and a 20% protective shield. Super projectiles fired during Hypercharge explode into wide-area cluster shockwaves!',
    },
    {
      id: 'desync',
      title: '🐛 Report Desync / Error 42',
      prompt: 'I experienced a desync during battle. What should I do?',
      reply:
        'Error 42 occurs if your network ping exceeds server tolerance or packet loss reaches 20%+. We have logged your session tick rate. You can also run the Titan Debug Console Network tab to calibrate your simulated latency.',
    },
  ];

  const faqs = [
    {
      category: '2.0 Progression',
      icon: '⚡',
      title: 'What happens to my 1.0 account progression in 2.0?',
      content:
        'All 1.0 brawler levels, trophies, and milestone progress have been grandfathered into the 2.0 Legacy System. You receive full value compensation packs including Legendary Paula Drops, Mega Boxes 2.0, Bling, and an exclusive Founding Veteran 1.0 badge.',
    },
    {
      category: '2.0 Progression',
      icon: '🌟',
      title: 'How do In-Match Paula Drops work?',
      content:
        'During 3v3 and Showdown matches, defeating rivals or destroying high-value crates now triggers dynamic 3D Paula Drops. Collecting them grants immediate combat buffs (overdrive speed, shield, ammo) and increases your post-match loot counter.',
    },
    {
      category: 'Account Recovery',
      icon: '🛡️',
      title: 'Linking Paula ID with Google Firebase Auth',
      content:
        'Click the profile icon in the top right of the Lobby to sign in with your Google account. Your Paula ID tag (e.g. #PAULA-7821) links directly to your secure cloud document in Firebase Firestore.',
    },
    {
      category: 'Purchases & Shop',
      icon: '💎',
      title: 'Missing Gems, Bling, or Brawl Pass in 2.0',
      content:
        'All purchases are validated against Google Play / App Store receipts. If your Gems or Bling do not reflect instantly, tap "Restore Purchases" in the Shop or file an urgent ticket with your Paula ID tag.',
    },
    {
      category: 'Gameplay & Physics',
      icon: '🎯',
      title: 'Virtual Joystick Aiming & Auto-Aim 2.0',
      content:
        'Paula Drops 2.0 features predictive auto-aim interpolation for dual-joysticks. Tapping the red or yellow button fires at the nearest enemy in range, while dragging lets you lead targets with line-of-sight indicators.',
    },
    {
      category: 'Fair Play',
      icon: '⚖️',
      title: 'Safe and Fair Play Policy in 3v3 Arena',
      content:
        'Match fixing, intentional idling (AFK), and unauthorized speed hacks are monitored by our server-authoritative netcode. Competitive bans apply to repeat offenders.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      (!activeCategory || f.category === activeCategory) &&
      (f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend) return;

    if (!customText) setInputMessage('');
    soundManager.playUiClick();

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Dynamic response from agent
    setTimeout(() => {
      setIsTyping(false);
      let replyText =
        "Thank you for contacting Paula Drops Support 2.0! We have received your query and logged diagnostic telemetry for your account. A support engineer has reviewed your message.";

      const lower = textToSend.toLowerCase();
      if (lower.includes('compensation') || lower.includes('reset') || lower.includes('level') || lower.includes('1.0')) {
        replyText =
          "Regarding your 2.0 Compensation: All 1.0 progress has been compiled. You can verify and claim your rewards directly via the '2.0 Compensation' window in the Lobby or Titan Debug Menu. All coins, gems, and drops are saved directly to your Paula ID cloud profile.";
      } else if (lower.includes('paula id') || lower.includes('google') || lower.includes('firebase') || lower.includes('save')) {
        replyText =
          "Paula ID Cloud Sync is actively operating through Firebase Firestore. When logged in with Google, your account data is saved automatically after every match or shop purchase.";
      } else if (lower.includes('brawler') || lower.includes('hypercharge') || lower.includes('vexa') || lower.includes('gulliver') || lower.includes('nyx')) {
        replyText =
          "Our 2.0 balance patch adjusted projectile velocity and added passive Supercharge traits for Tanks and Assassins. Let us know if you have specific balance feedback for the development team!";
      } else if (lower.includes('bug') || lower.includes('crash') || lower.includes('lag') || lower.includes('error')) {
        const ticketId = `#PD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        replyText = `We have registered a high-priority bug report for you under ticket ${ticketId}. Our QA engineers are inspecting match telemetry. You can track this under the 'ACTIVE TICKETS' tab.`;
        setTickets((prev) => [
          {
            id: ticketId,
            category: 'Bug Report',
            subject: textToSend.slice(0, 48) + '...',
            status: 'OPEN',
            priority: 'HIGH',
            createdAt: 'Just now',
            lastReply: 'Automated ticket creation from live chat triage.',
          },
          ...prev,
        ]);
      }

      soundManager.playUiClick();
      setChatHistory((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'agent',
          senderName: 'Agent Paula (Senior Support)',
          text: replyText,
          timestamp: 'Just now',
        },
      ]);
    }, 750);
  };

  const handleCopyTicket = (ticketId: string) => {
    soundManager.playUiClick();
    navigator.clipboard?.writeText(ticketId);
    setCopiedTicketId(ticketId);
    setTimeout(() => setCopiedTicketId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b-2 border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xl shadow-inner">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-brawl text-lg text-white tracking-wider">
                  PAULA DROPS SUPPORT 2.0
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-brawl border border-emerald-500/30">
                  HELPSHIFT OTTO 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated Triage • Live Escalation • Ticket Tracking
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-brawl text-base flex items-center justify-center transition-all border border-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2 font-brawl text-xs">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('chat');
            }}
            className={`py-2 px-4 rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💬</span> LIVE SUPPORT CHAT
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('tickets');
            }}
            className={`py-2 px-4 rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'tickets'
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎫</span> ACTIVE TICKETS
            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded-full text-[10px]">
              {tickets.length}
            </span>
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('faq');
            }}
            className={`py-2 px-4 rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'bg-slate-800 text-sky-400 border-t-2 border-sky-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📚</span> KNOWLEDGE BASE 2.0
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900 flex flex-col custom-scrollbar">
          
          {/* TAB 1: LIVE CONVERSATIONAL CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full justify-between gap-3">
              
              {/* Quick Decision Topics */}
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-brawl text-slate-400 block mb-2 uppercase tracking-wide">
                  ⚡ POPULAR 2.0 INQUIRIES (TAP FOR INSTANT TRIAGE):
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickTopics.map((qt) => (
                    <button
                      key={qt.id}
                      onClick={() => handleSendMessage(qt.prompt)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-sky-600 hover:text-white text-slate-200 border border-slate-700 transition-all font-sans font-medium active:scale-95 text-left"
                    >
                      {qt.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Scroll */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[260px] max-h-[360px]">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {msg.senderName && (
                      <span className="text-[10px] font-bold text-slate-400 px-1 mb-0.5">
                        {msg.senderName}
                      </span>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-sky-600 text-white rounded-br-none shadow-md'
                          : msg.sender === 'agent'
                          ? 'bg-indigo-900/90 text-indigo-100 border border-indigo-700/60 rounded-bl-none shadow-md'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-950/60 rounded-xl w-fit">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <span className="font-brawl text-[11px]">Support Agent is typing...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about 2.0 compensation, Paula ID sync, or report a bug..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500 placeholder:text-slate-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-brawl text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#065f46] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  SEND
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE SUPPORT TICKETS */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-brawl text-sm text-white uppercase tracking-wider">
                    YOUR SUPPORT 2.0 TICKETS
                  </h4>
                  <p className="text-xs text-slate-400">
                    Active inquiries linked to your Paula ID device session.
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleSendMessage('I would like to open a new support escalation ticket.');
                    setActiveTab('chat');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-brawl text-xs border border-sky-400 shadow-md"
                >
                  + NEW TICKET
                </button>
              </div>

              <div className="space-y-3">
                {tickets.map((tkt) => (
                  <div
                    key={tkt.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                          {tkt.id}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          [{tkt.category}]
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-brawl px-2 py-0.5 rounded uppercase tracking-wider ${
                            tkt.status === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                          }`}
                        >
                          {tkt.status}
                        </span>
                        <button
                          onClick={() => handleCopyTicket(tkt.id)}
                          className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded"
                          title="Copy Ticket ID"
                        >
                          {copiedTicketId === tkt.id ? 'COPIED!' : 'COPY ID'}
                        </button>
                      </div>
                    </div>

                    <h5 className="font-brawl text-sm text-white">
                      {tkt.subject}
                    </h5>

                    <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                      <strong>Latest Agent Response:</strong> {tkt.lastReply}
                    </p>

                    <span className="text-[10px] text-slate-500">
                      Logged: {tkt.createdAt} • Priority: {tkt.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: KNOWLEDGE BASE 2.0 */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles on 2.0 compensation, Hypercharge, or Paula ID..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-sky-500 pl-10 placeholder:text-slate-500"
                />
                <span className="absolute left-3.5 top-2.5 text-slate-500">🔍</span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-brawl">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-3 py-1.5 rounded-lg border ${
                    activeCategory === null
                      ? 'bg-sky-500 text-slate-950 border-sky-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  ALL ARTICLES
                </button>
                {['2.0 Progression', 'Account Recovery', 'Purchases & Shop', 'Gameplay & Physics', 'Fair Play'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg border whitespace-nowrap ${
                      activeCategory === cat
                        ? 'bg-sky-500 text-slate-950 border-sky-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Articles List */}
              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{faq.icon}</span>
                      <h4 className="font-brawl text-sm text-white">{faq.title}</h4>
                      <span className="ml-auto text-[10px] bg-slate-800 text-sky-300 px-2 py-0.5 rounded font-mono">
                        {faq.category}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{faq.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
