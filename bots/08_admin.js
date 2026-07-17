const {Client,GatewayIntentBits}=require('discord.js'),c=new Client({intents:[1,2,512,32768]}),fs=require('fs'),L=require('../modules/seguranca').log;
c.once('ready',()=>{L('ADMIN','🟢 ONLY ADMIN · '+c.ws.ping+'ms');reg('ONLY ADMIN','08_admin.js',c.ws.ping)})
function reg(n,a,p){const d=JSON.parse(fs.readFileSync('./data/bots.json'));const i=d.oficiais.findIndex(x=>x.arq===a);i>=0?d.oficiais[i]={nome:n,arq:a,ping,on:true,modulo:'ADMINISTRAÇÃO'}:d.oficiais.push({nome:n,arq:a,ping,on:true,modulo:'ADMINISTRAÇÃO'});fs.writeFileSync('./data/bots.json',JSON.stringify(d,null,2))}
c.login(process.env.TOKEN_08_ADMIN);
