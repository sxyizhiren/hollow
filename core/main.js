var renrenUtil=require('../lib/renrenUtil').INST;
var weiboUtil=require('../lib/weiboUtil').INST;
var path=require('path');
var fs=require('fs');
var assert=require('assert');
var Step=require('step');



var renrenFile;
var weiboFile;
var wechatInfo;
var callbackFn;
var renren=new renrenUtil();
var weibo=new weiboUtil();
var foots;
var hands;
var filters;


function cookieExpireActionDefault(){
    //cookie 过期后默认的动作是退出程序
    process.exit(0);
}

function buildPlugins(){
    hands={
        wechat:{
            exec:require('../lib/Hands/wechatHand').Hand,
            params:[
                wechatInfo.token,
                wechatInfo.url
            ]
        }
    };
    foots={
        log:{
            exec:require('../lib/Foots/logFoot').Foot,
            params:[]
        },
        post:{
            exec:require('../lib/Foots/postFoot').Foot,
            params:[]
        },
        weibo:{
            exec:require('../lib/Foots/weiboFoot').Foot,
            params:[weibo.getLoginInfo()]
        },
        ctrl:{
            exec:require('../lib/Foots/ctrlFoot').Foot,
            params:[cookieExpireActionDefault]  //cookie失效时的动作
        }
    };

    filters=[
        function(messageBody){
            console.log(messageBody);
            return messageBody;
        },
        require('../lib/Filters/eroticaFilter').filter,
        require('../lib/Filters/legalFilter').filter
    ];
}


function serialLogin(){
    var renrenLogined;
    var weiboLogined;
    Step(
        function(){
            //Login RenRen
            var renrenAccount=JSON.parse(fs.readFileSync(renrenFile,'utf8'));
            renren.Login(renrenAccount,this);
        },
        function(err,loginInfo){
            //renren login callback
            if(loginInfo.logined){
                saveAccount(renrenFile,loginInfo);
                console.log('renren Login Succ!');
            }else{
                console.log('renren Login Fail!');
            }
            renrenLogined=loginInfo.logined;
            this();
        },
        function(){
            //Login Weibo
            var weiboAccount=JSON.parse(fs.readFileSync(weiboFile,'utf8'));
            weibo.Login(weiboAccount,this);
        },
        function(err,logininfo){
            //weibo login callback
            if(logininfo.logined){
                console.log('weibo Login Success！');
                saveAccount(weiboFile,logininfo);
            }else{
                console.log('weibo Login Fail!');
            }
            weiboLogined=logininfo.logined;
            this();
        },
        function(){
            //start work
            if(renrenLogined && weiboLogined){
                buildPlugins();
                renren.Start(hands,foots,filters,callbackFn);
            }else{
                callbackFn('Login Fail',{
                    renren:renrenLogined,
                    weibo:weiboLogined
                });
            }
        }
    );
}






function saveAccount(file,logininfo){
    //JSON.stringify(value [, replacer] [, space]),replacer是过滤器，函数或者数组，space分隔符或缩进数
    //只保存email，passwd和cookie3个字段，缩进4个空格
    fs.writeFileSync(file,JSON.stringify(logininfo,null,4), 'utf8');
}

function setRenrenFile(fullFilename){
    renrenFile=fullFilename;
}

function setWeiboFile(fullFilename){
    weiboFile=fullFilename;
}

function setWechatInfo(info){
    wechatInfo=info;
}

function setCallback(callback){
    callbackFn=callback;
}

function work(renrenfile,weibofile,wechatinfo,callback){
    setRenrenFile(renrenfile);
    setWeiboFile(weibofile);
    setWechatInfo(wechatinfo);
    setCallback(callback);
    serialLogin();
}


exports.work=work;