const sg=require('simple-git'),fs=require('fs'),L=require('./seguranca').log;
module.exports=async(msg='auto')=>{
 try{
  const g=sg({baseDir:process.cwd()});
  if(!await g.checkIsRepo())await g.init().addRemote('origin',process.env.GIT_REPO);
  await g.add('.').commit(msg).push(['-f','-u','origin','main']);
  L('GIT','✅ enviado → Onlyo.git → Render');return true;
 }catch(e){L('GIT','❌ '+e.message);return false}
}
