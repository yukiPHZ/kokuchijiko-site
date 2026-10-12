(function(root){
  'use strict';
  const c=root.KokuchijikoTrackingContract, pack=root.MarketObserverRuntimePackage;
  const consent=root.MarketObserverConsent, tracker=root.MarketObserver;
  if(!c || !pack || !consent || !tracker) return;
  const route=c.routes[root.location.pathname];
  const production=c.enabled===true && root.location.origin===c.productionOrigin && Boolean(route);
  function choice(){
    const state=consent.read().state;
    root['ga-disable-'+c.measurementId]=!production || state!=='granted';
    return state;
  }
  choice();
  root.addEventListener('click',event=>{
    if(event.target.closest('[data-action="deny"]')) root['ga-disable-'+c.measurementId]=true;
    else choice();
  },true);
  root.addEventListener('storage',choice);
  root.addEventListener('pagehide',choice);
  document.addEventListener('visibilitychange',choice);
  consent.mount({locale:'ja',privacyUrl:'/about/#analytics',settingsContainerSelector:'.site-footer',presentation:'quiet',containerSelector:'#analytics-consent'});
  let ready=false, actions=0;
  if(production && choice()==='granted') {
    ready=tracker.init({measurementId:c.measurementId,runtimeSchema:pack.runtimeSchema,runtimeSchemaHash:pack.runtimeSchemaHash,profile:pack.profiles[c.projectId],profileHash:pack.profileHashes[c.projectId],pageContext:route}).ok;
    if(ready) tracker.trackPageView();
  }
  function send(event,params,action){
    if(!production || !ready || choice()!=='granted') return false;
    const keys=Object.keys(params).sort().join(',');
    if(event==='game_start' || event==='replay'){
      if(keys!=='mode' || !c.modes.includes(params.mode)) return false;
    }else if(event==='game_over'){
      if(keys!=='mode,outcome' || !c.modes.includes(params.mode) || params.outcome!=='complete') return false;
    }else if(event==='cta_click'){
      if(keys!=='content_type,cta_group,cta_id,destination_type,route_id' || !c.ctaAliases.includes(params.cta_id) || params.route_id!==route.route_id || params.content_type!==route.content_type) return false;
    }else return false;
    return tracker.track(event,params,{actionToken:action}).ok;
  }
  root.KokuchijikoObservation=Object.freeze({send});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[data-observer-cta]');
    if(!link || !c.ctaAliases.includes(link.dataset.observerCta)) return;
    send('cta_click',{...route,cta_id:link.dataset.observerCta,cta_group:link.dataset.observerGroup==='related_work'?'related_work':'navigation',destination_type:link.dataset.observerGroup==='related_work'?'external':'internal'},'cta-'+(++actions));
  });
})(globalThis);
