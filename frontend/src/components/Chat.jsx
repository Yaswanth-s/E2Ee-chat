import React, {useEffect, useState} from 'react';
import { initSodium, generateKeypair, deriveSharedKey, encryptMessage, decryptMessage } from '../services/crypto';

export default function Chat({ token, apiBase, user }){
  const [sodiumReady, setSodiumReady] = useState(false);
  const [keypair, setKeypair] = useState(null);
  const [ws, setWs] = useState(null);
  const [conversation, setConversation] = useState({id:1});
  const [theirPub, setTheirPub] = useState(null);
  const [sharedKey, setSharedKey] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(()=>{ (async()=>{ await initSodium(); setSodiumReady(true); })(); },[]);

  async function ensureKeypair(){
    const s = localStorage.getItem('kp');
    if(s){ setKeypair(JSON.parse(s)); return; }
    const kp = await generateKeypair();
    localStorage.setItem('kp', JSON.stringify(kp));
    setKeypair(kp);
    // NOTE: upload public key to server via API in production
  }

  async function openChatWithDemo(){
    await ensureKeypair();
    // in demo assume other party public key retrieved separately - for now use same public key (loopback)
    const kp = keypair || JSON.parse(localStorage.getItem('kp'));
    setTheirPub(kp.publicKey);
    const sk = await deriveSharedKey(kp.privateKey, kp.publicKey);
    setSharedKey(sk);
    const socket = new WebSocket('ws://localhost:8001/ws/chat/'); // dev
    socket.onopen = ()=> { console.log('ws open'); socket.send(JSON.stringify({action:'join', conversation_id:1})); };
    socket.onmessage = async (evt)=>{
      const d = JSON.parse(evt.data);
      if(d.action === 'new_message'){
        const m = d.message;
        const pt = await decryptMessage(sk, m.ciphertext, m.nonce);
        setMessages(prev=>[...prev,{id:m.id, sender:m.sender, text:pt}]);
      }
    }
    setWs(socket);
  }

  async function sendMsg(){
    if(!ws || !sharedKey) return;
    const enc = await encryptMessage(sharedKey, text);
    ws.send(JSON.stringify({action:'send_message', conversation_id:conversation.id, ciphertext:enc.ciphertext, nonce:enc.nonce}));
    setMessages(prev=>[...prev,{id:'local'+Date.now(), sender:user.id, text}]);
    setText('');
  }

  return (<div>
    <button onClick={openChatWithDemo}>Open Demo Chat (loopback)</button>
    <div style={{border:'1px solid #ccc', padding:10, marginTop:10, height:300, overflow:'auto'}}>
      {messages.map(m=> <div key={m.id}><b>{m.sender}</b>: {m.text}</div>)}
    </div>
    <div style={{marginTop:10}}>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder='message' />
      <button onClick={sendMsg}>Send</button>
    </div>
  </div>);
}
