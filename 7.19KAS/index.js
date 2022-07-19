let express = require('express');
let app = express();

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended:false}));

//klaytn설정
let Caver = require('caver-js');
let CaverExtKAS = require('caver-js-ext-kas');
let caver = new CaverExtKAS();


let keyringContainer = new caver.keyringContainer();
let keyring = keyringContainer.keyring.createFromPrivateKey('0x3d54228003bf9a4d3e5c18dbb108e8e4dd6518a49cdb3c6480879b7061aa46dc');  
keyringContainer.add(keyring);

let accesskey = 'KASKM76JPDV3Y7QBZDZ12RMK';
let secretaccesskey = 'hlKXMRSsxiDRXYb0Y_lH6cPtmUAUAQNw3aXa49yY';
let chainId = 1001; // 1001은 test net , 8217번은 메인넷 
caver.initKASAPI(chainId, accesskey, secretaccesskey); //KAS 초기화(시작을 하겠다)
let kip7 = new caver.kct.kip7('0xcdAF68595099b57242061C48fC3a5e5509188685');  //kip7이랑 erc20이랑 비슷한 개념!
kip7.setWallet(keyringContainer); //kip7 내의 wallet 설정
//klaytn설정 끝

//송금 함수
async function token_trans(address, token){
    let receipt = await kip7.transfer(address, token, { from : keyring.address })
    return receipt;
}

//조회 함수
async function balanceOf(address){
    let receipt = await kip7.balanceOf(address, {
        from : keyring.address
    })
    return receipt;
}

app.get('/signup', (req, res) => {
    res.render('signup.ejs');
})

app.post('/signup2', (req, res) => {
    let id = req.body._id;
    let password = req.body._password;
    let wallet =  req.body._wallet;
    console.log(id, password, wallet);
    res.send(id, password, wallet);
})

app.get('/trans', function(req, res){
    res.render('trans.ejs');
})

app.post('/trans2', function(req, res){
    let address =req.body._address;
    let token = req.body._token;
    token_trans(address, token).then(function(receipt){
        console.log(receipt);
        res.redirect('/trans');
    })
})

app.get('/balance', function(req, res){
    let address = '0xC2c5867D06C61D782DC348500CE9335ceE2787A7';
    balanceOf(address).then(function(result){
        console.log(result);
        res.send(result);
    })
})


//api를 통해서 지갑을 생성
app.get('/get_wallet', function(req, res){
    account = async() => {
        res.json(await caver.kas.wallet.createAccount());
    }
    account();
})


app.get('/', function(req, res){
    res.render('main.ejs');
});





let port = 3000;
app.listen(port, function(){
    console.log('서버를 시작합니다');
})