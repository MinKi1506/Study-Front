let express = require('express');
let app = express();

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/', function(req, res){
    res.render('main.ejs');
});

let port = 3000;
app.listen(port, function(){
    console.log('서버를 시작합니다');
})