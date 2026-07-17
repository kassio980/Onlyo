const jwt=require('jsonwebtoken'),bcrypt=require('bcryptjs'),rl=require('express-rate-limit'),fs=require('fs');
const tentativas={},bloqueados={};
module.exports={
 hash:s=>bcrypt.hashSync(s,10),
 compara:(s,h)=>bcrypt.compareSync(s,h),
 tok:d=>jwt.sign(d,process.env.JWT_SECRET,{expiresIn:'24h'}),
 verifica:(r,s,n)=>{try{r.user=jwt.verify(r.headers.authorization?.split(' ')[1]||r.cookies?.tk,process.env.JWT_SECRET);n()}catch(e){s.status(401).json({ok:0})}},
 loginLimiter:rl({windowMs:60000,limit:5,handler:(r,s)=>{const ip=r.ip;tentativas[ip]=(tentativas[ip]||0)+1;if(tentativas[ip]>=10){bloqueados[ip]=Date.now()+900000;setTimeout(()=>delete bloqueados[ip],900000)}s.status(429).json({ok:0})}}),
 antiBloqueio:(r,s,n)=>bloqueados[r.ip]&&bloqueados[r.ip]>Date.now()?s.status(403).json({ok:0}):n(),
 log:(t,m)=>{const l=`[${new Date().toLocaleString('pt-BR')}] [${t}] ${m}\n`;fs.appendFileSync('./logs/geral.log',l);fs.appendFileSync(`./logs/${t.toLowerCase()}.log`,l);const g=JSON.parse(fs.readFileSync('./data/logs.json'));g.unshift({tipo:t==='ERRO'?'erro':t==='AVISO'?'aviso':'ok',txt:l.trim()});fs.writeFileSync('./data/logs.json',JSON.stringify(g.slice(0,200)));return l}
}
