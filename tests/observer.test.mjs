import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameObservation} from '../src/observer-events.mjs';
test('unknown, denied and GPC-derived denied never emit; grant permits only fixed actions',()=>{
  for(const choice of ['unknown','denied','gpc','granted']){
    const events=[];
    const o=createGameObservation((event,params,action)=>events.push({event,params,action}),()=>choice,['ten','all','review']);
    o.start('ten');o.complete();o.complete();o.replay('review');o.start('review');o.complete();
    assert.equal(events.length,choice==='granted'?5:0);
    if(choice==='granted')assert.deepEqual(events.map(x=>[x.event,x.params]),[['game_start',{mode:'ten'}],['game_over',{mode:'ten',outcome:'complete'}],['replay',{mode:'review'}],['game_start',{mode:'review'}],['game_over',{mode:'review',outcome:'complete'}]]);
  }
});
test('invalid modes, repeated results and revoked consent do not emit; sink failure is harmless',()=>{
  const events=[];let choice='granted';
  const o=createGameObservation((...args)=>events.push(args),()=>choice,['ten','all','review']);
  assert.equal(o.start('r113'),false);o.complete();assert.equal(events.length,0);
  o.start('all');choice='denied';o.complete();o.replay('all');assert.equal(events.length,1);
  const broken=createGameObservation(()=>{throw Error('Unavailable');},()=> 'granted',['ten']);
  assert.equal(broken.start('ten'),false);assert.equal(broken.complete(),false);
});
