// Fibo Pro 5.0 D1-backed API (separate Worker deployment)
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json; charset=utf-8'};
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers});
const validSymbol=s=>/^\d{4,6}$/.test(s||'');
export default {
 async fetch(request,env){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  const url=new URL(request.url),path=url.pathname;
  if(request.method!=='GET')return json({status:'error',message:'Method not allowed'},405);
  if(path==='/api/health')return json({status:'ok',database:!!env.DB,upstream:!!env.HISTORY_API});
  if(!env.DB)return json({status:'error',message:'D1 DB binding is missing'},503);
  if(path==='/api/history'){
   const symbol=url.searchParams.get('symbol'),market=url.searchParams.get('market')||'auto';
   if(!validSymbol(symbol))return json({status:'error',message:'Invalid symbol'},400);
   const months=Math.max(1,Math.min(36,Number(url.searchParams.get('months')||12)||12));
   const cutoff=new Date();cutoff.setUTCMonth(cutoff.getUTCMonth()-months);
   const data=(await env.DB.prepare('SELECT date,open,high,low,close,volume,market FROM daily_prices WHERE symbol=? AND date>=? ORDER BY date ASC LIMIT 1000').bind(symbol,cutoff.toISOString().slice(0,10)).all()).results||[];
   if(data.length)return json({status:'ok',symbol,market:data.at(-1).market,count:data.length,ohlc:true,source:'d1',data:data.map(({market,...bar})=>bar)});
   if(!env.HISTORY_API)return json({status:'error',symbol,message:'No cached history and HISTORY_API is not configured'},404);
   const upstream=new URL('/api/history',env.HISTORY_API);
   upstream.searchParams.set('symbol',symbol);upstream.searchParams.set('market',market);upstream.searchParams.set('months',String(months));
   try{
    const res=await fetch(upstream,{signal:AbortSignal.timeout(20000)});
    if(!res.ok)return json({status:'error',message:'Upstream HTTP '+res.status},502);
    const payload=await res.json();
    if(payload.status!=='ok'||!Array.isArray(payload.data)||!payload.data.length)return json({status:'error',message:payload.message||'No upstream OHLC data'},502);
    const rows=payload.data.filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&['open','high','low','close','volume'].every(k=>Number.isFinite(Number(r[k])))&&Number(r.high)>=Number(r.low));
    const stmt=env.DB.prepare('INSERT INTO daily_prices(symbol,market,date,open,high,low,close,volume,source) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(symbol,date) DO UPDATE SET market=excluded.market,open=excluded.open,high=excluded.high,low=excluded.low,close=excluded.close,volume=excluded.volume,source=excluded.source,updated_at=CURRENT_TIMESTAMP');
    for(let i=0;i<rows.length;i+=50)await env.DB.batch(rows.slice(i,i+50).map(r=>stmt.bind(symbol,payload.market||market,r.date,+r.open,+r.high,+r.low,+r.close,+r.volume,'upstream')));
    return json({...payload,data:rows,source:'upstream-cached'});
   }catch(e){return json({status:'error',message:'Upstream unavailable: '+e.message},502)}
  }
  if(path==='/api/scan'){
   const symbols=[...new Set((url.searchParams.get('symbols')||'').split(',').filter(validSymbol))].slice(0,30);
   const rule=url.searchParams.get('rule')||'ma';
   if(!symbols.length||!['ma','rsi','volume','breakout'].includes(rule))return json({status:'error',message:'Invalid symbols or rule'},400);
   const results=[];
   for(const symbol of symbols){
    const a=(await env.DB.prepare('SELECT date,close,high,volume FROM daily_prices WHERE symbol=? ORDER BY date DESC LIMIT 40').bind(symbol).all()).results.reverse();
    if(a.length<21){results.push({symbol,status:'insufficient_data'});continue}
    const last=a.at(-1),prev=a.slice(-21,-1),ma=prev.reduce((s,r)=>s+r.close,0)/20;
    let gain=0,loss=0;for(let i=a.length-14;i<a.length;i++){const d=a[i].close-a[i-1].close;gain+=Math.max(0,d);loss+=Math.max(0,-d)}
    const rsi=loss===0?100:100-100/(1+gain/loss);
    const vol=prev.reduce((s,r)=>s+r.volume,0)/20;
    const matched=rule==='ma'?last.close>ma:rule==='rsi'?rsi<35:rule==='volume'?last.volume>vol*1.5:last.close>Math.max(...prev.map(r=>r.high));
    results.push({symbol,status:'ok',date:last.date,close:last.close,ma20:ma,rsi14:rsi,matched});
   }
   return json({status:'ok',rule,results});
  }
  return json({status:'error',message:'Not found'},404);
 }
};