import { useState, useEffect, useRef, useCallback } from 'react'
import { useUIStore } from '../store/uiStore'
import { safeCopy } from '../lib/clipboard'

interface Message {
  id: string
  sender: 'me' | 'them'
  text: string
  time: string
}

interface Conversation {
  id: string
  name: string
  initials: string
  avatarColor: string
  lastMessage: string
  lastTime: string
  unread: number
  messages: Message[]
}

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const INITIAL_CONVOS: Conversation[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    initials: 'SC',
    avatarColor: '#FE2C55',
    lastMessage: 'It shows! Do you use CapCut?',
    lastTime: '2m',
    unread: 2,
    messages: [
      { id: 'm1', sender: 'them', text: "Hey! I loved your latest video 😍", time: '10:14 AM' },
      { id: 'm2', sender: 'them', text: "The transition at 0:45 was so smooth!", time: '10:14 AM' },
      { id: 'm3', sender: 'me', text: "Thank you so much! 🙏 It took a while to perfect", time: '10:15 AM' },
      { id: 'm4', sender: 'them', text: "It shows! Do you use CapCut or a different editor?", time: '10:16 AM' },
    ],
  },
  {
    id: '2',
    name: 'Marcus Williams',
    initials: 'MW',
    avatarColor: '#25F4EE',
    lastMessage: 'Can we collab on a dance trend?',
    lastTime: '15m',
    unread: 1,
    messages: [
      { id: 'm1', sender: 'them', text: "Hey! Big fan of your content 🔥", time: '10:02 AM' },
      { id: 'm2', sender: 'me', text: "Thanks Marcus! Love your videos too 👊", time: '10:04 AM' },
      { id: 'm3', sender: 'them', text: "Can we collab on a dance trend?", time: '10:06 AM' },
    ],
  },
  {
    id: '3',
    name: 'Luna Rodriguez',
    initials: 'LR',
    avatarColor: '#7C3AED',
    lastMessage: '¿Cuándo tienes tiempo libre?',
    lastTime: '1h',
    unread: 3,
    messages: [
      { id: 'm1', sender: 'them', text: "¡Hola! Acabo de ver tu último video y quedé impresionada 😍", time: '9:12 AM' },
      { id: 'm2', sender: 'them', text: "¡Me encantó tu contenido! ¿Podemos hacer un dueto juntos?", time: '9:13 AM' },
      { id: 'm3', sender: 'me', text: "¡Hola! ¡Muchas gracias, me alegra que te haya gustado!", time: '9:14 AM' },
      { id: 'm4', sender: 'them', text: "¿Cuándo tienes tiempo libre para grabar juntos?", time: '9:22 AM' },
    ],
  },
  {
    id: '4',
    name: 'TikTok Creator Hub',
    initials: 'TC',
    avatarColor: '#010101',
    lastMessage: 'Your account has been verified ✓',
    lastTime: '3h',
    unread: 0,
    messages: [
      { id: 'm1', sender: 'them', text: "🎉 Congratulations! Your account has been verified ✓", time: '7:30 AM' },
      { id: 'm2', sender: 'them', text: "You now have access to Creator tools, live streaming, and analytics.", time: '7:30 AM' },
    ],
  },
  {
    id: '5',
    name: 'Jake Thompson',
    initials: 'JT',
    avatarColor: '#F97316',
    lastMessage: 'Thanks for the follow! Check out my latest 🎵',
    lastTime: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm1', sender: 'them', text: "Thanks for the follow! Check out my latest video 🎵", time: 'Yesterday' },
      { id: 'm2', sender: 'me', text: "Followed! Your music videos are fire 🔥", time: 'Yesterday' },
    ],
  },
  {
    id: '6',
    name: 'Aria Patel',
    initials: 'AP',
    avatarColor: '#EC4899',
    lastMessage: 'What filter did you use on that last post?',
    lastTime: '2d',
    unread: 0,
    messages: [
      { id: 'm1', sender: 'them', text: "Your aesthetic is absolutely amazing ✨", time: '2 days ago' },
      { id: 'm2', sender: 'them', text: "What filter did you use on that last post?", time: '2 days ago' },
      { id: 'm3', sender: 'me', text: "Thank you! I use the \"Vintage Film\" preset in VSCO 📸", time: '2 days ago' },
    ],
  },
]

type ContextMenuState = { x: number; y: number; text: string } | null

function Avatar({ initials, color, size }: { initials: string; color: string; size: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: 'white', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.31), fontWeight: 700,
    }}>
      {initials}
    </div>
  )
}

export function DemoMessagingView() {
  const { setIsDemoMode, setActiveView, setDemoToolbar, pendingDemoText, setPendingDemoText } = useUIStore()

  const [convos, setConvos] = useState<Conversation[]>(INITIAL_CONVOS)
  const [activeId, setActiveId] = useState('1')
  const [inputText, setInputText] = useState('')
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)

  const threadRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeConvo = convos.find(c => c.id === activeId)!

  // Consume pending demo text injected by toolbar Send buttons
  useEffect(() => {
    if (!pendingDemoText) return
    setInputText(pendingDemoText)
    setPendingDemoText('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [pendingDemoText, setPendingDemoText])

  // Scroll to bottom on conversation switch or new message
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [activeId, convos])

  // Close context menu on outside click or Escape
  useEffect(() => {
    if (!contextMenu) return
    const onMouse = () => setContextMenu(null)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setContextMenu(null) }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [contextMenu])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const text = window.getSelection()?.toString().trim()
    if (!text) return
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, text })
  }, [])

  const selectConvo = (id: string) => {
    setActiveId(id)
    setConvos(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
  }

  const sendMessage = () => {
    const text = inputText.trim()
    if (!text) return
    const msg: Message = { id: Date.now().toString(), sender: 'me', text, time: nowTime() }
    setConvos(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastTime: 'now', unread: 0 }
        : c
    ))
    setInputText('')
  }

  const exitDemo = () => {
    setIsDemoMode(false)
    setActiveView('messaging')
  }

  const contextMenuItems = [
    { icon: '📋', label: 'Copy', action: () => { safeCopy(contextMenu!.text); setContextMenu(null) } },
    { icon: '🤖', label: 'AI Reply', action: () => { setDemoToolbar('ai', contextMenu!.text); setContextMenu(null) } },
    { icon: '🌐', label: 'Translate', action: () => { setDemoToolbar('translate', contextMenu!.text); setContextMenu(null) } },
    { icon: '✍️', label: 'Quick Reply', action: () => { setDemoToolbar('quick-reply', contextMenu!.text); setContextMenu(null) } },
  ]

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--background)' }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <div style={{
        width: 300, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--background)',
      }}>
        {/* Header */}
        <div style={{
          padding: '11px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', flex: 1 }}>
            Direct Messages
          </span>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #FE2C55, #FF6B88)',
            color: 'white', borderRadius: 99, padding: '2px 7px',
          }}>
            DEMO
          </span>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {convos.map(convo => (
            <button
              key={convo.id}
              onClick={() => selectConvo(convo.id)}
              style={{
                width: '100%', padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
                background: convo.id === activeId ? 'var(--accent)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.1s',
              }}
            >
              <Avatar initials={convo.initials} color={convo.avatarColor} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 4 }}>
                  <span style={{
                    fontSize: 13, fontWeight: convo.unread > 0 ? 700 : 500,
                    color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {convo.name}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--muted-foreground)', flexShrink: 0 }}>
                    {convo.lastTime}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, gap: 4 }}>
                  <span style={{
                    fontSize: 11, color: 'var(--muted-foreground)', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    fontWeight: convo.unread > 0 ? 600 : 400,
                  }}>
                    {convo.lastMessage}
                  </span>
                  {convo.unread > 0 && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, background: '#FE2C55', color: 'white',
                      borderRadius: 99, padding: '2px 5px', flexShrink: 0,
                    }}>
                      {convo.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Exit demo button */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={exitDemo}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = '#FE2C55'
              el.style.color = '#FE2C55'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = 'var(--border)'
              el.style.color = 'var(--muted-foreground)'
            }}
          >
            ✕ Exit Demo Mode
          </button>
        </div>
      </div>

      {/* ── Thread view ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Thread header */}
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Avatar initials={activeConvo.initials} color={activeConvo.avatarColor} size={32} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
            {activeConvo.name}
          </span>
        </div>

        {/* Messages */}
        <div
          ref={threadRef}
          onContextMenu={handleContextMenu}
          style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}
        >
          {activeConvo.messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: 7,
              }}
            >
              {msg.sender === 'them' && (
                <Avatar initials={activeConvo.initials[0]} color={activeConvo.avatarColor} size={24} />
              )}
              <div style={{
                maxWidth: '65%', padding: '9px 13px', wordBreak: 'break-word',
                borderRadius: msg.sender === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.sender === 'me'
                  ? 'linear-gradient(135deg, #FE2C55 0%, #FF6B88 100%)'
                  : 'var(--muted)',
                color: msg.sender === 'me' ? 'white' : 'var(--foreground)',
                fontSize: 13, lineHeight: 1.5, userSelect: 'text',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Context-menu hint */}
        <div style={{ padding: '3px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>
            💡 Select any message text and right-click to use AI Reply, Translate, or Quick Reply
          </span>
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <input
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Type a message…"
            style={{
              flex: 1, padding: '9px 14px', borderRadius: 22,
              border: '1px solid var(--border)', background: 'var(--muted)',
              color: 'var(--foreground)', fontSize: 13, outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            style={{
              padding: '9px 18px', borderRadius: 22, border: 'none', flexShrink: 0,
              background: inputText.trim() ? 'linear-gradient(135deg, #FE2C55, #FF6B88)' : 'var(--muted)',
              color: inputText.trim() ? 'white' : 'var(--muted-foreground)',
              fontSize: 13, fontWeight: 600,
              cursor: inputText.trim() ? 'pointer' : 'default',
              transition: 'all 0.15s',
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* ── Context menu ───────────────────────────────────────────────────── */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 9999,
            background: 'var(--background)', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            overflow: 'hidden', minWidth: 170,
          }}
          onMouseDown={e => e.stopPropagation()}
        >
          {contextMenuItems.map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                width: '100%', padding: '8px 14px',
                display: 'flex', alignItems: 'center', gap: 9,
                background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: 13, color: 'var(--foreground)', transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
