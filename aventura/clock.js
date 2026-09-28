(function(root){
 'use strict';
 // Speed changes how many IDENTICAL fixed steps run, never the size of a step.
 class Clock{
  constructor(step=1/60){this.step=step;this.accumulator=0;this.ticks=0;}
  advance(realSeconds,speed,update){
   if(!Number.isFinite(realSeconds)||realSeconds<=0||![1,2,3].includes(speed))return 0;
   this.accumulator+=realSeconds*speed;
   let n=Math.floor((this.accumulator+1e-10)/this.step);
   this.accumulator-=n*this.step;
   if(this.accumulator<0)this.accumulator=0;
   for(let i=0;i<n;i++){update(this.step);this.ticks++;}
   return n;
  }
  reset(){this.accumulator=0;}
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=Clock;else root.LuccareClock=Clock;
})(typeof window!=='undefined'?window:globalThis);
