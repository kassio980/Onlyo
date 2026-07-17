const {Client,GatewayIntentBits}=require('discord.js'),c=new Client({intents:[1,2,512,32768]}),fs=require('fs'),L=require('../modules/seguranca').log;
c.once('ready',()=>{L('SEGURANÇA','🟢 ONLY SECURITY · '+c.ws.ping+'ms');reg('ONLY SECURITY','06_seguranca.js',c.ws.ping)})
c.on('messageCreate',async m=>{if(m.author.bot)return;if((m.content.match(/https?:\/\//g)||[]).length>=3){try{await m.delete();L('SEGURANÇA','⚠️ spam '+m.author.tag)}catch(e){}}})
function reg(n,a,p){const d=JSON.parse(fs.readFileSync('./data/bots.json'));const i=d.oficiais.findIndex(x=>x.arq===a);i>=0?d.oficiais[i]={nome:n,arq:a,ping,on:true,modulo:'SEGURANÇA'}:d.oficiais.push({nome:n,arq:a,ping,on:true,modulo:'SEGURANÇA'});fs.writeFileSync('./data/bots.json',JSON.stringify(d,null,2))}
c.login(process.env.TOKEN_06_SECURITY);
