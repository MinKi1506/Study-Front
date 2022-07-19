let CaverExtKAS = require('caver-js-ext-kas');
let caver = new CaverExtKAS();

let accesskey = 'KASKM76JPDV3Y7QBZDZ12RMK';
let secretaccesskey = 'hlKXMRSsxiDRXYb0Y_lH6cPtmUAUAQNw3aXa49yY';
let chainId = 1001; // 1001은 test net , 8217번은 메인넷 
caver.initKASAPI(chainId, accesskey, secretaccesskey); //KAS 초기화(시작을 하겠다)

let keyringContainer = new caver.keyringContainer();
let keyring = keyringContainer.keyring.createFromPrivateKey('0x3d54228003bf9a4d3e5c18dbb108e8e4dd6518a49cdb3c6480879b7061aa46dc'); //지갑에 있는 프라이빗 키 값
keyringContainer.add(keyring); //새로운 월렛 추가(KAS 지갑 주소가 아닌, 외부의 지갑 주소를 등록할 때 사용 -> 이 하나의 privatekey로 만들어진 지갑은 KAS와 BAOBAO둘다 연동된다!)


async function create_token(){
let kip7 = await caver.kct.kip7.deploy({   //await=이 작업이 실행 될 때 까지 기다린다는 뜻! 이걸 쓸려면 위에 async를 적어줘야한다. 이작업을 안해주면 주소가 만들어지기 전에 consol.log를 띄워버려서 undifined라고 나온다
    name : 'sangkeumboss',  //토큰의 이름
    symbol : 'SB',          //토큰의 심볼
    decimals : 0,            //토큰 소수점 자리
    initialSupply : 1000000 //토큰 발행량
}, keyring.address, keyringContainer)
console.log(kip7._address);
}

create_token();