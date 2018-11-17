const express = require('express');
const sha1 = require('sha1');

const {getUserDataAsync, parseXMLDataAsync, formatMessage} = require('./utils/tools');
const template = require('./reply/template');

const app = express();

const config = {
  appID: 'wxf581ae1a7999bd35',
  appsecret: 'd18a1c16bbffc63631951164b8b7bb10',
  token: 'weixin0810'
}

app.use(async (req, res, next) => {
  console.log(req.query);

  const {signature, echostr, timestamp, nonce} = req.query;
  const {token} = config;
  const str = sha1([timestamp, nonce, token].sort().join(''));

  if (req.method === 'GET') {

    if (signature === str) {

      res.end(echostr);
    } else {

      res.end('error');
    }
  } else if (req.method === 'POST') {

    if (signature !== str) {
      res.end('error');
      return;
    }

    const xmlData = await getUserDataAsync(req);
    console.log(xmlData);

    const jsData = await parseXMLDataAsync(xmlData);
    console.log(jsData);

    const message = formatMessage(jsData);
    console.log(message);

    let options = {
      toUserName: message.FromUserName,
      fromUserName: message.ToUserName,
      createTime: Date.now(),
      msgType: 'text'
    }
    

    let content = '你在说什么，我听不懂~';
    

    if (message.Content === '1') {
      content = '大吉大利，今晚吃鸡';
    } else if (message.Content === '2') {
      content = '落地成盒';
    } else if (message.Content.includes('爱')) {
      content = '我爱你~';
    } else if (message.Content === '3') {

      options.msgType = 'news';
      options.title = '游戏攻略~';
      options.description = 'weixin0810~';
      options.picUrl = 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=821105795,3802172768&fm=27&gp=0.jpg';
      options.url = 'http://yys.163.com/';
    }
  
    options.content = content;
  
    const replyMessage = template(options);
    console.log(replyMessage);
    

    res.send(replyMessage);
    
  } else {
    res.end('error');
  }
  
})


app.listen(3000, err => {
  if (!err) console.log('服务器启动成功了~');
  else console.log(err);
})