hollow
======

树洞
从微信接受消息，同步发送到人人和微博
=======================================
install：

npm install -d hollow

=====================================

usage:
var hollow=require('hollow');

var path=require('path');

var rerenAccountFile=path.join(__dirname,'/renren.json');

var weiboAccountFile=path.join(__dirname,'/weibo.json');

var wechatInfo={        //微信公共主页的信息，都可在微信公共主页申请时进行设置，

    token:'hollowzjut', //微信公共主页的token

    url:'/wechat'       //微信接收消息的url，

};

hollow.work(rerenAccountFile,weiboAccountFile,wechatInfo,function(err,info){

    console.log(err);

    console.log(info);

});

/////////////////////////////////////////////
renren.json内容如下：
{

    "email": "xxxxxxxxxx",

    "passwd": "xxxxx",

    "isPage": "true"

}
weibo.json内容如下：
{

    "email": "xxxxxxx",

    "passwd": "xxxx"

}
/////////////////////////////////////////////

注意：如果weibo或者人人的cookie失效了，默认的动作是退出程序，所以需要外面做好退出自动重启的控制。
人人每天凌晨会cookie失效，微博cookie失效还未知。

比如用一个main.js写上上面的usage内容，再用一个daddy.js写下面的内容：

//如果要输验证码的话，直接调目标文件，不要从这里进入
function start(jsName)
{

    console.log('Daddy Process Is Running.');

    var ls = require('child_process').spawn('node', [jsName]);

    ls.stdout.on('data', function (data)
    {

        console.log(data.toString());

    });
    ls.stderr.on('data', function (data)
    {

        console.log(data.toString());

    });
    ls.on('exit', function (code)
    {

        console.log('Child Process Exited With Code ' + code);

        delete(ls);

        setTimeout(start,5000,jsName);

    });

}

start('main.js');

//这个简单的文件可以起到自动重启的功能

我的邮箱786647787@qq.com