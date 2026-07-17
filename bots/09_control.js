const {Client,GatewayIntentBits}=require('discord.js'),c=new Client({intents:[1,512]}),fs=require('fs'),L=require('../modules/seguranca').log;
c.once('ready',()=>{L('CONTROLE','🟢 ONLY CONTROL · '+c.ws.ping+'ms');reg('ONLY CONTROL','09_control.js',c.ws.ping)})
function reg(n,a,p){const d=JSON.parse(fs.readFileSync('./data/bots.json'));const i=d.oficiais.findIndex(x=>x.arq===a);i>=0?d.oficiais[i]={nome:n,arq:a,ping,on:true,modulo:'CONTROLE'}:d.oficiais.push({nome:n,arq:a,ping,on:true,modulo:'CONTROLE'});fs.writeFileSync('./data/bots.json',JSON.stringify(d,null,2))}
c.login(process.env.TOKEN_09_CONTROL);
