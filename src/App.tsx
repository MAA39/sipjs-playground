import { useState, useRef, useCallback } from 'react'
import { SimpleUser, SimpleUserOptions } from 'sip.js/lib/platform/web'
import { URI } from 'sip.js/lib/grammar'

type LogEntry = {
  time: string
  message: string
  type: 'info' | 'error' | 'success'
}

function App() {
  // 接続設定
  const [wsUrl, setWsUrl] = useState('wss://your-asterisk-ip:8089/ws')
  const [sipUser, setSipUser] = useState('webrtc_client')
  const [sipPassword, setSipPassword] = useState('webrtc_client')
  const [callTarget, setCallTarget] = useState('sip:200@your-asterisk-ip:8089')

  // 状態
  const [isConnected, setIsConnected] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [hasIncomingCall, setHasIncomingCall] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  // refs
  const simpleUserRef = useRef<SimpleUser | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('ja-JP')
    setLogs(prev => [...prev.slice(-50), { time, message, type }])
  }, [])

  // 接続
  const handleConnect = async () => {
    try {
      // audio要素を作成
      if (!audioRef.current) {
        audioRef.current = document.createElement('audio')
        audioRef.current.autoplay = true
      }

      const serverHostname = new URL(wsUrl).hostname

      const options: SimpleUserOptions = {
        delegate: {
          onServerConnect: () => {
            addLog('SIPサーバーに接続しました', 'success')
            setIsConnected(true)
          },
          onServerDisconnect: (error) => {
            addLog(`SIPサーバーから切断されました ${error?.message || ''}`, 'error')
            setIsConnected(false)
            setIsRegistered(false)
            setIsInCall(false)
          },
          onRegistered: () => {
            addLog('REGISTER完了', 'success')
            setIsRegistered(true)
          },
          onUnregistered: () => {
            addLog('REGISTER解除', 'info')
            setIsRegistered(false)
          },
          onCallReceived: () => {
            addLog('着信あり！', 'info')
            setHasIncomingCall(true)
          },
          onCallAnswered: () => {
            addLog('通話開始', 'success')
            setIsInCall(true)
            setHasIncomingCall(false)
          },
          onCallHangup: () => {
            addLog('通話終了', 'info')
            setIsInCall(false)
            setHasIncomingCall(false)
          },
        },
        media: {
          constraints: { audio: true, video: false },
          remote: { audio: audioRef.current },
        },
        userAgentOptions: {
          logLevel: 'debug',
          uri: new URI('sip', sipUser, serverHostname),
          authorizationUsername: sipUser,
          authorizationPassword: sipPassword,
        },
      }

      const simpleUser = new SimpleUser(wsUrl, options)
      simpleUserRef.current = simpleUser

      addLog('接続中...')
      await simpleUser.connect()
    } catch (error) {
      addLog(`接続エラー: ${error}`, 'error')
    }
  }

  // 切断
  const handleDisconnect = async () => {
    try {
      await simpleUserRef.current?.disconnect()
      simpleUserRef.current = null
    } catch (error) {
      addLog(`切断エラー: ${error}`, 'error')
    }
  }

  // REGISTER
  const handleRegister = async () => {
    try {
      addLog('REGISTER送信中...')
      await simpleUserRef.current?.register()
    } catch (error) {
      addLog(`REGISTERエラー: ${error}`, 'error')
    }
  }

  // 発信
  const handleCall = async () => {
    try {
      addLog(`発信中: ${callTarget}`)
      await simpleUserRef.current?.call(callTarget)
    } catch (error) {
      addLog(`発信エラー: ${error}`, 'error')
    }
  }

  // 応答
  const handleAnswer = async () => {
    try {
      addLog('応答中...')
      await simpleUserRef.current?.answer()
    } catch (error) {
      addLog(`応答エラー: ${error}`, 'error')
    }
  }

  // 切断
  const handleHangup = async () => {
    try {
      addLog('通話終了中...')
      await simpleUserRef.current?.hangup()
    } catch (error) {
      addLog(`終話エラー: ${error}`, 'error')
    }
  }

  return (
    <div className="container">
      <h1>📞 SIP.js Playground</h1>

      <div className="form-group">
        <label>WebSocket URL</label>
        <input
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          placeholder="wss://your-asterisk-ip:8089/ws"
          disabled={isConnected}
        />
      </div>

      <div className="form-group">
        <label>SIP User</label>
        <input
          value={sipUser}
          onChange={(e) => setSipUser(e.target.value)}
          disabled={isConnected}
        />
      </div>

      <div className="form-group">
        <label>SIP Password</label>
        <input
          type="password"
          value={sipPassword}
          onChange={(e) => setSipPassword(e.target.value)}
          disabled={isConnected}
        />
      </div>

      <div className="form-group">
        <label>発信先 (SIP URI)</label>
        <input
          value={callTarget}
          onChange={(e) => setCallTarget(e.target.value)}
          placeholder="sip:200@your-asterisk-ip:8089"
        />
      </div>

      <div className="button-group">
        {!isConnected ? (
          <button className="btn-connect" onClick={handleConnect}>
            接続
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            切断
          </button>
        )}

        <button
          className="btn-register"
          onClick={handleRegister}
          disabled={!isConnected || isRegistered}
        >
          REGISTER
        </button>

        {!isInCall ? (
          <button
            className="btn-call"
            onClick={handleCall}
            disabled={!isConnected}
          >
            発信
          </button>
        ) : (
          <button className="btn-hangup" onClick={handleHangup}>
            終話
          </button>
        )}

        {hasIncomingCall && (
          <button className="btn-answer" onClick={handleAnswer}>
            応答
          </button>
        )}
      </div>

      <div className="status">
        <div className="status-item">
          <span>接続状態</span>
          <span className={`status-value ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '接続中' : '未接続'}
          </span>
        </div>
        <div className="status-item">
          <span>REGISTER</span>
          <span className={`status-value ${isRegistered ? 'connected' : 'disconnected'}`}>
            {isRegistered ? '登録済' : '未登録'}
          </span>
        </div>
        <div className="status-item">
          <span>通話</span>
          <span className={`status-value ${isInCall ? 'connected' : ''}`}>
            {isInCall ? '通話中' : hasIncomingCall ? '着信中' : '待機'}
          </span>
        </div>
      </div>

      <div className="logs">
        {logs.map((log, i) => (
          <div key={i} className={`log-entry ${log.type}`}>
            [{log.time}] {log.message}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App