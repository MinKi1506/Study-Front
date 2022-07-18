let express = require('express');
let app = express();

let mysql = require('mysql2');
let connection = mysql.createConnection({
    host : 'localhost',
    port : 3306,
    user : 'root',
    password : '1234',
    database : 'minkidb'
})

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('main.ejs');
})

app.get('/ajax', function(req, res){  //페이지를 이동할 때에는 동기, 한 페이지 내에서 작업할 떄는 비동기를 주로 사용한다
    let name = req.query._name;
    let phone = req.query._phone;
    console.log(name, phone);

    res.json({
        a : 'ajax 요청 성공'
    })
})

app.post('/ajax_post', function(req, res){
    let name = req.body._name;
    let phone = req.body._phone;

    console.log(name, phone);
    res.json(
        {
            a : 'post 비동기 통신 완료!' 
        }
    )
})

app.get('/ajax_getjson', function(req, res){
    let name = req.query._name;
    console.log(name);
    res.json(
        {
            a : 'get_json 통신 성공!' 
        }
    )

})

app.get('/signup', function(req, res){
    res.render('signup.ejs');
})

app.get('/check_id', function(req, res){
    let id = req.query._id;
    console.log(id);
    connection.query(
        `select * from user where ID = ?`,[id],
        function(err, result){
            if(err){
                console.log('아이디 중복조회 에러: '+err);
            }else{
                if(result.length == 0){
                    res.send('가입가능한 ID입니다')
                }else{
                    res.send('이미 있는 ID입니다.')
                }
            }
        }
    )
})


let port = 3000
app.listen(port, function(){
    console.log('서버를 시작합니다')
})