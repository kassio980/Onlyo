const {Client,GatewayIntentBits}=require('discord.js'),c=new Client({intents:[1,512,32768]}),fs=require('fs'),L=require('../modules/seguranca').log;
c.once('ready',()=>{L('ATENDIMENTO','🟢 ONLY TICKETS · '+c.ws.ping+'ms');reg('ONLY TICKETS','07_tickets.js',c.ws.ping)})
function reg(n,a,p){const d=JSON.parse(fs.readFileSync('./data/bots.json'));const i=d.oficiais.findIndex(x=>x.arq===a);i>=0?d.oficiais[i]={nome:n,arq:a,ping,on:true,modulo:'ATENDIMENTO'}:d.oficiais.push({nome:n,arq:a,ping,on:true,modulo:'ATENDIMENTO'});fs.writeFileSync('./data/bots.json',JSON.stringify(d,null,2))}
c.login(process.env.TOKEN_07_TICKETS);
