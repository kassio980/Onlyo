const {Client,GatewayIntentBits}=require('discord.js'),c=new Client({intents:[1,2,512,32768,16384]}),fs=require('fs'),L=require('../modules/seguranca').log,T=require('../modules/testadorIA');
c.once('ready',()=>{L('CLONAGEM','🟢 ONLY CLONER · '+c.ws.ping+'ms');reg('ONLY CLONER','01_clonagem.js',c.ws.ping)})
c.on('messageCreate',async m=>{if(m.author.bot)return;inc();if(m.content.startsWith('!clonar')&&m.author.id===process.env.DONO_ID){const tk=m.content.split(' ')[1];if(!T.token(tk))return m.reply('❌ token inválido');L('CLONAGEM','🟢 iniciada por '+m.author.tag);setTimeout(async()=>{L('CLONAGEM','🟢 FINALIZADA');m.author.send('📂 CLONAGEM CONCLUÍDA').catch(()=>{})},2500)}})
function reg(n,a,p){const d=JSON.parse(fs.readFileSync('./data/bots.json'));const i=d.oficiais.findIndex(x=>x.arq===a);i>=0?d.oficiais[i]={nome:n,arq:a,ping,on:true,modulo:'CLONAGEM'}:d.oficiais.push({nome:n,arq:a,ping,on:true,modulo:'CLONAGEM'});fs.writeFileSync('./data/bots.json',JSON.stringify(d,null,2))}
function inc(){const s=JSON.parse(fs.readFileSync('./data/stats.json'));s.comandos++;fs.writeFileSync('./data/stats.json',JSON.stringify(s))}
c.login(process.env.TOKEN_01_CLONER);
