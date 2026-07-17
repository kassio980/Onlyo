const r=require('express').Router(),{spawn}=require('child_process'),fs=require('fs'),L=require('../modules/seguranca').log;
global.PID=global.PID||{};
r.post('/start',(req,res)=>{const{arq}=req.body;const p=spawn('node',['bots/'+arq],{detached:true,stdio:'ignore'});global.PID[arq]=p.pid;p.unref();L('BOT','▶️ '+arq+' LIGADO');res.json({ok:1})});
r.post('/stop',(req,res)=>{const{arq}=req.body;try{process.kill(global.PID[arq],'SIGKILL')}catch(e){}delete global.PID[arq];L('BOT','⏸️ '+arq+' DESLIGADO');res.json({ok:1})});
r.post('/restart',(req,res)=>{const{arq}=req.body;try{process.kill(global.PID[arq],'SIGKILL')}catch(e){}delete global.PID[arq];setTimeout(()=>{const p=spawn('node',['bots/'+arq],{detached:true,stdio:'ignore'});global.PID[arq]=p.pid;p.unref();L('BOT','🔄 '+arq)},450);res.json({ok:1})});
module.exports=r;
