const {Client,GatewayIntentBits}=require('discord.js'),c=new Client({intents:[1,512]}),fs=require('fs'),L=require('../modules/seguranca').log,os=require('os');
c.once('ready',()=>{L('TÉCNICO','🟢 ONLY TEC · '+c.ws.ping+'ms');reg('ONLY TEC','04_tec.js',c.ws.ping)})
c.on('messageCreate',m=>{if(m.author.bot||m.author.id!==process.env.DONO_ID)return;if(m.content==='!status')m.reply(`⚙️ CPU ${os.loadavg()[0].toFixed(2)} · RAM ${(process.memoryUsage().rss/1048576).toFixed(0)}MB`)})
function reg(n,a,p){const d=JSON.parse(fs.readFileSync('./data/bots.json'));const i=d.oficiais.findIndex(x=>x.arq===a);i>=0?d.oficiais[i]={nome:n,arq:a,ping,on:true,modulo:'TÉCNICO'}:d.oficiais.push({nome:n,arq:a,ping,on:true,modulo:'TÉCNICO'});fs.writeFileSync('./data/bots.json',JSON.stringify(d,null,2))}
c.login(process.env.TOKEN_04_TEC);
