(function(root){
 'use strict';
 class Audio{
  constructor(){this.context=null;this.enabled=false;this.volume=.25;this.lastAttack=0;this.lastPop=0;}
  async activate(){if(!this.enabled)return;try{this.context=this.context||new (window.AudioContext||window.webkitAudioContext)();if(this.context.state==='suspended')await this.context.resume();}catch(_){} }
  tone(freq,duration=.08,kind='sine',delay=0,gain=.13){
   if(!this.enabled||!this.context||this.context.state!=='running')return;
   const c=this.context,o=c.createOscillator(),a=c.createGain(),start=c.currentTime+delay;o.type=kind;o.frequency.setValueAtTime(freq,start);o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.75),start+duration);
   a.gain.setValueAtTime(0,start);a.gain.linearRampToValueAtTime(gain*this.volume,start+.009);a.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(a);a.connect(c.destination);o.start(start);o.stop(start+duration+.02);o.onended=()=>{o.disconnect();a.disconnect();};
  }
  play(event){
   if(!this.enabled)return;const now=performance.now();
   if(event.type==='attack'){if(now-this.lastAttack<100)return;this.lastAttack=now;const tones={brush:[620,'sine'],floss:[940,'triangle'],fluoride:[330,'sine'],water:[470,'triangle']};const [f,w]=tones[event.tower]||[600,'sine'];this.tone(f,.045,w,0,.04);return;}
   if(event.type==='pop'){if(now-this.lastPop<160)return;this.lastPop=now;this.tone(740,.035,'sine',0,.03);return;}
   if(event.type==='boss'){this.tone(155,.23,'triangle');this.tone(220,.2,'triangle',.18);return;}
   if(event.type==='roar'){this.tone(170,.23,'triangle');this.tone(340,.2,'sine',.1);return;}
   if(['won','bossDown','upgrade'].includes(event.type)){[440,554,660].forEach((f,i)=>this.tone(f,.15,'sine',i*.085));return;}
   if(event.type==='lost'){this.tone(280,.2);this.tone(210,.25,'sine',.17);return;}
   if(event.type==='leak'){this.tone(392,.09,'sine',0,.09);this.tone(330,.12,'sine',.07,.08);return;}
   if(event.type==='summon'){this.tone(262,.12,'triangle');this.tone(311,.12,'triangle',.08);return;}
   if(['buy','clear','wave','sell'].includes(event.type))this.tone(event.type==='wave'?500:800,.1);
  }
 }
 root.LuccareAudio=Audio;
})(window);
