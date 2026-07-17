const r=require('express').Router(),fs=require('fs'),os=require('os');
r.get('/',(req,res)=>{
 const bots=JSON.parse(fs.readFileSync('./data/bots.json')),stats=JSON.parse(fs.readFileSync('./data/stats.json'));
 const logs=JSON.parse(fs.readFileSync('./data/logs.json')).slice(-12).reverse();
 const dias=[],valores=[];
 for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*86400000).toISOString().slice(0,10);dias.push(d.slice(5));valores.push(stats.grafico[d]||0)}
 res.json({bots:bots.oficiais.length+bots.criados.length,servers:1,users:stats.membros,verificados:stats.verificados,lista_bots:bots.oficiais.map(b=>({...b,on:!!global.PID&&global.PID[b.arq]})),dias,valores,logs,ram:(process.memoryUsage().rss/1048576).toFixed(0),cpu:os.loadavg()[0].toFixed(2)});
});
module.exports=r;
