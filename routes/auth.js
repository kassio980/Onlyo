const r=require('express').Router(),S=require('../modules/seguranca'),fs=require('fs');
r.post('/login',S.loginLimiter,S.antiBloqueio,(req,res)=>{
 const{u,s}=req.body,db=JSON.parse(fs.readFileSync('./data/usuarios.json'));
 if(!db[u]||!S.compara(s,db[u].senha))return res.json({ok:0,m:'credenciais erradas'});
 res.json({ok:1,tk:S.tok({u,admin:!!db[u].admin,id:db[u].id_dono})});
 S.log('AUTENTICAÇÃO',`✅ ${u} · IP ${req.ip}`);
});
r.get('/eu',S.verifica,(req,res)=>res.json({ok:1,...req.user}));
module.exports=r;
