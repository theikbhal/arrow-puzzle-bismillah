/* audio.js - game sound effects (synthesized, no files) + background sound:
   built-in ambient (rain, brown noise, fireplace, breath, nature, calm pad) or your own files from audio/tracks.js */
const Snd=(()=>{let ac,sfxG,musG,white,brown,nodes=[],timers=[],el=null,C={sound:true,sfxVol:.7,musVol:.35,pack:'chime',music:'off'};
 const SC=[1,9/8,5/4,3/2,5/3,2,9/4,5/2]; /* major pentatonic: each cleared arrow sounds a step higher */
 function ctx(){if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();sfxG=ac.createGain();musG=ac.createGain();sfxG.connect(ac.destination);musG.connect(ac.destination);
  const mk=f=>{const n=ac.sampleRate*3,b=ac.createBuffer(1,n,ac.sampleRate);f(b.getChannelData(0),n);return b};
  white=mk((d,n)=>{for(let i=0;i<n;i++)d[i]=Math.random()*2-1});brown=mk((d,n)=>{let l=0;for(let i=0;i<n;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}})}
  if(ac.state==='suspended')ac.resume();return ac}
 function tone(f,d,o={}){const t=ac.currentTime+(o.at||0),os=ac.createOscillator(),g=ac.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(o.vol??.25,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+d);os.connect(g);g.connect(o.dest||sfxG);os.start(t);os.stop(t+d+.05)}
 function puff(d,f0,f1,vol,at=0,q=1,dest){const t=ac.currentTime+at,s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=white;f.type='bandpass';f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+d);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(dest||sfxG);s.start(t);s.stop(t+d+.05)}
 const PACK={chime:(f,at=0)=>{tone(f,.5,{at,vol:.22});tone(f*2,.3,{at,vol:.06})},
  wood:(f,at=0)=>{puff(.05,1400,900,.35,at,3);tone(f/2,.12,{at,type:'triangle',vol:.2})},  /* tasbih-bead click */
  water:(f,at=0)=>tone(f*1.3,.2,{at,to:f*.55,vol:.22})};
 function sfx(n,s=0){if(!C.sound)return;ctx();sfxG.gain.value=C.sfxVol;const p=PACK[C.pack]||PACK.chime,f=392*SC[s%8]*(s>=8?2:1);
  if(n==='clear'){puff(.3,500,2400,.07);p(f)}
  else if(n==='blocked'){tone(160,.28,{to:90,type:'triangle',vol:.3});puff(.08,300,150,.15)}
  else if(n==='win')[0,2,4,5,7].forEach((k,i)=>p(392*SC[k],i*.11))
  else if(n==='lose')tone(330,.55,{to:165,vol:.22,type:'triangle'})
  else if(n==='hint'){tone(1320,.18,{vol:.12});tone(1760,.22,{at:.1,vol:.1})}}
 function stop(){nodes.forEach(n=>{try{n.stop()}catch(e){}});nodes=[];timers.forEach(clearInterval);timers=[];if(el){el.pause();el=null}}
 function loop(buf,filters,vol){const s=ac.createBufferSource();s.buffer=buf;s.loop=true;let n=s;filters.forEach(([ty,fr,q])=>{const b=ac.createBiquadFilter();b.type=ty;b.frequency.value=fr;if(q)b.Q.value=q;n.connect(b);n=b});
  const g=ac.createGain();g.gain.value=vol;n.connect(g);g.connect(musG);s.start();nodes.push(s);return g}
 const AMB={rain:()=>loop(white,[['highpass',700],['lowpass',7000]],.22),brown:()=>loop(brown,[],.5),
  fire:()=>{loop(brown,[['lowpass',500]],.7);timers.push(setInterval(()=>{if(Math.random()<.6)puff(.02,3500,2000,.2+Math.random()*.3,0,1,musG)},140))},
  breath:()=>{const g=loop(white,[['bandpass',600,.7]],.2),l=ac.createOscillator(),d=ac.createGain();l.frequency.value=.12;d.gain.value=.18;l.connect(d);d.connect(g.gain);l.start();nodes.push(l)},
  nature:()=>{loop(white,[['bandpass',1800,.4]],.05);timers.push(setInterval(()=>{if(Math.random()<.7){const f=2200+Math.random()*1800;tone(f,.12,{to:f*1.4,vol:.07,dest:musG});tone(f*1.1,.1,{at:.15,to:f*1.5,vol:.06,dest:musG})}},1800))},
  pad:()=>{const g=ac.createGain(),l=ac.createOscillator(),d=ac.createGain();g.gain.value=.5;l.frequency.value=.07;d.gain.value=.25;l.connect(d);d.connect(g.gain);l.start();nodes.push(l);g.connect(musG);
   [146.83,220,293.66,329.63].forEach(f=>{const o=ac.createOscillator(),v=ac.createGain();o.frequency.value=f;v.gain.value=.05;o.connect(v);v.connect(g);o.start();nodes.push(o)})}};
 function music(id){stop();C.music=id;if(!id||id==='off')return;ctx();musG.gain.value=C.musVol;if(AMB[id]){AMB[id]();return}
  const t=(window.ISLAMIC_TRACKS||[]).find(x=>x.id===id);if(t){el=new Audio('audio/'+t.file);el.loop=true;el.volume=C.musVol;el.play().catch(()=>{})}}
 const vol=()=>{if(musG)musG.gain.value=C.musVol;if(el)el.volume=C.musVol};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){ac&&ac.suspend();el&&el.pause()}else{ac&&ac.resume();el&&el.play().catch(()=>{})}});
 return{cfg:o=>{C=o},sfx,music,vol,AMBIENT:Object.keys(AMB)}})();
