let express = require('express');
let app = express();
require('dotenv').config();
let moment = require('moment');

let session =require('express-session');
app.use(
    session({
        secret : process.env.session,
        resave : false,
        saveUninitialized : true,
        maxAge : 3600000
    })
)

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(__dirname+'/public')); //외부파일을 참조할 때, /public이하의 주소를 기본 주소로 하겠다.

//klaytn설정
let Caver = require('caver-js');
let CaverExtKAS = require('caver-js-ext-kas');
let caver = new CaverExtKAS();

//klaytn contract 연결
let cav = new Caver('https://api.baobab.klaytn.net:8651');
let product_contract = require('./build/contracts/safe,json');
let smartcontract = new cav.klay.Contract(product_contract.abi, product_contract.networks['1001'].address);
let account = cav.klay.accounts.createWithAccountKey(process.env.address, process.env.privatekey);
cav.klay.accounts.wallet.add(account);


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

//mysql 설정
var mysql = require("mysql2");
const { isKRN } = require('caver-js-ext-kas/src/utils/helper');
var connection = mysql.createConnection({
    host : process.env.host,
    port : process.env.port, 
    user : process.env.user, 
    password : process.env.password, 
    database : process.env.database
})

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

//로그인
app.post('/signin', function(req, res){
    let id = req.body._id;
    let password = req.body._password;
    console.log(id, password);

    connection.query(
        `select * from user_list where ID = ? AND password = ?`,[id, password],
        function(err, result){
            if(err){
                console.log('로그인 에러: '+err);
            }else{
                if(result.length > 0){
                    req.session.login = result[0];
                    res.render('index.ejs')
                }else{
                res.redirect('/')
                }
            }
        }
    )
})

//회원가입 페이지이동
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
})

//회원가입
app.post('/signup2', (req, res) => {
    let id = req.body._id;
    let password = req.body._password;
    let wallet =  req.body._wallet;
    console.log(id, password, wallet);
    connection.query(
        `insert into user_list values (?,?,?)`,[id,password,wallet],
        function(err){
            if(err){
                console.log('회원가입 에러: '+err);
            }else{
                console.log('회원가입 성공! 반갑습니다 '+id+'님');
                res.redirect('/main');
            }
        }
    )
})

//송금페이지 이동
app.get('/trans', function(req, res){
    res.render('trans.ejs');
})

//송금
app.post('/trans2', function(req, res){
    let address =req.body._address;
    let token = req.body._token;
    token_trans(address, token).then(function(receipt){
        console.log(receipt);
        res.redirect('/trans');
    })
})

//잔액확인
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


//
app.get('/main', function(req, res){
    if(!req.session.login){
        res.redirect('/');
    }else{
        res.render('index.ejs');
    }
})


//리뷰 작성 페이지 이동
app.get('/add_review', function(req, res){
    if(!req.session.login){
        res.redirect('/');
    }else{
        res.render('add_review.ejs');
    }
})

//리뷰 추가
app.post('/add_review2', function(req, res){
    let num = req.body._num;
    let region = req.body._region;
    let type = req.body._type;
    console.log(num, region, type);

    connection.query(
        `insert into review_list(num,region,type) values (?,?,?)`,[num,region,type],
        function(err){
            if(err){
                console.log('여행리스트 추가 오류:'+err);
                res.send('추가 오류입니다');
            }else{
                console.log('리뷰가 추가 되었습니다');
                res.redirect('/main');
            }
        }
    )
})

app.get('/list', function(req, res){
    if(!req.session.login){
        res.redirect('/')
    }else{
        connection.query(
            `select * from review_list`,
            function(err, result){
                if(err){
                    console.log('리뷰 불러오기 에러: '+err);
                }else{
                    res.render('review_list.ejs'),{
                        list : result
                    }
                }
            }
        )
    }
})

app.get('check', function(req, res){
    if(!req.session.login){
        res.redirect('/');
    }else{
        let num = req.query._num;
        res.render('check.ejs', {
            num : num
        })
    }
})

app.post('/check2', function(req, res){
    /*
    contract에서 add_check()함수에 매개변수  -> 로그인을 한 사람의 지갑 주소, 차량 번호(리뷰 번호), 점검 결과, 현재시간
    check1,2,3 -> 점검 결과
    로그인한 사람의 지갑 주소 -> req.session.login.wallet 에 존재한다!
    현재시간 -> moment 라이브러리 사용하여 현재시간
    */
    let check1 = req.body.check1;
    let check2 = req.body.check2;
    let check3 = req.body.check3;
    let checks = check1 + check2 +check3;
    let checker = req.session.login.wallet;
    let check_date = moment().format('YYYY/MM/DD HH:mm:ss');
    console.log(check1,check2,check3,checker,check_date);
    if(!req.session.login){
        res.redirect('/')
    }else{
        smartcontract.methods
        .add_check(checker, num, checks, check_date)
        .send({
            from : account.address,
            gas : 2000000
        })
        .then(function(receipt){
            console.log(receipt);
            res.redirect('/reward');
        })
    }

    //점검을 한 사람에게 리워드 주기
app.get('/reward', function(req, res){
    let address = req.session.login.wallet;
    let reward = 10;
    token_trans(address, reward).then(function(receipt){
        console.log(receipt);
        res.redirect('/main');
    })
})

app.get('/check_list', function(req, res){
    if(!req.session.login){
        res.redirect('/');
    }else{
        connection.query(
            `select * from review_list`,
            function(err, result){
                if(err){
                    console.log('리뷰 불러오기 에러: '+err);
                }else{
                        res.render('review_list_m.ejs', {
                            list : result
                        })
                }
            }
        )
    }
})

app.get('/check_info', function(req, res){
    if(!req.session.login){
        res.redirect('/');
    }else{
        let num = req.query._num;
        smartcontract.methods
        .get_list(num)
        .call()
        .then(function(receipt){
            console.log(receipt);
            res.render('check_info.ejs', {
                result : receipt
            })
        })
    }
})

//해당 리뷰 num을 가진 모든 점검사항들을 리스트형태로 보여주는 api
app.get('/check_info2', function(req, res){
    if(!req.session.login){
        res.redirect('/');
    }else{
        let num = req.query._num;
        let check_array = new Array();
        smartcontract.methods
        .total_count()
        .call()
        .then(function(count){
            for(let i = 0; i < count; i++){
                smartcontract.methods
                .get_checks(i)
                .call()
                .then(function(receipt){
                    if(receipt[1] == num){
                        check_array.push(receipt);
                    }
                })
            }
        })

        console.log(check_array)
        res.render('check_list2.ejs', {
            list : check_array
        })

    }
})



})



app.get('/', function(req, res){
    res.render('main.ejs');
});





let port = 3000;
app.listen(port, function(){
    console.log('서버를 시작합니다');
})