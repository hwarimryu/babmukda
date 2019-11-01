// 모듈을 추출합니다.
var express = require('express');
var app = express();
var server = app.listen(3001, function () {
    console.log('Server Running at http://127.0.0.1:3001');
});
var ejs = require('ejs')
var fs = require('fs')
// 웹 서버를 생성합니다.
var app = express();
app.use(express.urlencoded({ extended: true }))


// db연결
var mysql = require('mysql');
var dbConfig = {
    user: 'root',
    port: 3306,
    password: '1234',
    database: 'o2'
}
var conn = mysql.createConnection(dbConfig);

//login, session
var session = require('express-session')
var MySQLStore = require('express-mysql-session')(session)
var sessionStore = new MySQLStore(dbConfig)
app.use(session({
    secret: '!@#$%babmukdasession',//쿠키 임의 변조 값.
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}))

//폴더 사용
path = require('path');
// app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/css'));
// app.use(express.static(__dirname + '/images_gp'));
app.use(express.static(__dirname + '/img'));
//사진
app.use('/img', express.static(path.join(__dirname, 'img')));

// //static폴더 사용
// path = require('path');
// //html
// app.use(express.static(__dirname + '/public'));
// // app.use(express.static(__dirname + '../css'));
// app.use(express.static(__dirname + '/css'));
// // app.use(express.static(__dirname + '/public/gp'));
// app.use(express.static(__dirname + '/public/gp'));
// app.use(express.static(__dirname + '/images_gp'));
// app.use(express.static(__dirname + '/images_rcp'));

//사진
// app.use('/images_gp', express.static(path.join(__dirname, 'images_gp')));
// app.use('/images',express.static(path.join(__dirname, 'data')));
// app.use('/images_rcp',express.static(path.join(__dirname, 'images_rcp')));

// var routes = require('./routes')(io);


//라우팅:공구/레시피/채팅
var router=require('./router/main')(app,conn)//라우터모듈인 main.js 를 불러와서 app 에 전달
var gpRouter = require('./router/servicegp')(express,conn)
app.set('views',__dirname+'/views')//서버가 html을 읽을수 있도고 html위치를 정의
app.set('view engine','ejs')
app.engine('html',require('ejs').renderFile)//서버가 html렌더링 할 때 ejs엔진 사용하도록 설정함.


app.use(express.static(__dirname+'/public'))
// app.use('/',router)

var gpRouter = require('./router/servicegp');
app.use('/servicegp', gpRouter)
var chatRouter = require('./chat');
app.use('/chat', chatRouter)
// app.use('/', routes);
// app.use(app.router);
// routes.initialize(app);
var rcpRouter= require('./servicercp');
app.use('/servicercp', rcpRouter)


// var fs = require('fs');


// app.use(static(__dirname + '/public'));

//Store all HTML files in view folder.
// app.use(express.static(__dirname + '/Script'));
//Store all JS and CSS in Scripts folder.

//html파일들
// var homepage = require('./public/main.html');
/* 1.login이 되었는 지 확인하는 곳 : ture->/welocome 
                                    false->/login
*/
// app.get('/', function (req, res) {
//     console.log(req.url)
//     console.log(req.session.userId)

//     if (req.session.userId)
//         res.redirect('/welcome');
//     else
//         res.redirect('/login');


// });
app.get('/signin', function (req, res) {
    console.log(req.url + "->" + req.method)
    res.type('.html')
    res.sendFile(path.join(__dirname + '/public/signin.html'));
})
app.post('/signin', function (req, res) {
    console.log(req.url + "->" + req.method)
    var body = req.body;

    conn.query('insert into member values(?,?,?,?)', [body.id, body.name, body.password, body.address], function (err) {
        if (err) {
            console.log(err)
        } else {
            req.session.userId = body.id
            req.session.save(function () {
                res.redirect('/')
            })
        }
    })
})

// /* 3. login이 된 후 mainPage */
// app.get('/welcome', function (req, res) {
//     console.log('/welcome')
//     fs.readFile('public/main.html', 'utf8', function (error, data) {
//         // 데이터베이스 쿼리를 실행합니다.
//         if (error) console.log(error)
//         res.send(ejs.render(data, { data: req.session.userId }))
//     })
// })


app.get('/products/:id', function (request, response) {
    // 변수를 선언합니다.
    // var id = Number(request.param('id')); //이전방식
    var id = Number(request.params.id);
    console.log(request.method + ': ' + request.url)

    // 데이터베이스 요청을 수행합니다.
    conn.query('SELECT * FROm gpitems WHERE id=?', [
        id
    ], function (error, data) {
        response.send(data);
    })
});

app.post('/products', function (request, response) {
    // 변수를 선언합니다.
    // console.log(request)

    console.log(request.body.name)
    var name = request.body.name
    var modelnumber = request.body.modelnumber
    var series = request.body.series

    // 데이터베이스 요청을 수행합니다.
    conn.query('INSERT INTO products (name, modelnumber, series) VALUES(?,?,?)', [
        name, modelnumber, series
    ], function (error, data) {
        response.send(data);
    });
});

app.get('/myinfo', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    console.log(userId)
    fs.readFile('public/myinfo.html', 'utf8', function (error, member) {
        // 데이터베이스 쿼리를 실행합니다.
        if (error) console.log(error)
        conn.query("SELECT * FROM member where userid=?",
            [userId], function (error, result) {
                console.log(result[0])
                if (error) console.log(error)
                res.send(ejs.render(member, {
                    member: result[0]
                }))
            });
    });
})

app.get('/gping', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    console.log(userId)
    fs.readFile('public/myrequest.html', 'utf8', function (error, member) {
        // 데이터베이스 쿼리를 실행합니다.
        if (error) console.log(error)

        res.send(ejs.render(member, userId))
    })
})
app.get('/myreqfull', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    conn.query(`select * from request_full r,gpitems g where r.host="${userId}" and g.id=r.gpid`, function (error, result) {
        // 데이터베이스 쿼리를 실행합니다.
        if (error) console.log(error)
        console.log(result)
        res.send(result)
    })

})
app.get('/myreq', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    conn.query(`select * from request r,gpitems g where r.host="${userId}" and g.id=r.gpid`, function (error, result) {
        // 데이터베이스 쿼리를 실행합니다.
        if (error) console.log(error)
        console.log(result)
        res.send(result)
    })

})
app.get('/myreq2', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    conn.query(`select * from request r,gpitems g where r.member="${userId}" and g.id=r.gpid`, function (error, result) {
        // 데이터베이스 쿼리를 실행합니다.
        if (error) console.log(error)
        console.log(result)
        res.send(result)
    })

})
app.get('/mychat', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    conn.query(`select * from chat_room r,chat_member m where m.member="${userId}" and r.id=m.rid`, function (error, result) {
        // 데이터베이스 쿼리를 실행합니다.
        if (error) console.log(error)
        console.log(result)
        res.send(result)
    })

})

// var server = app.listen(5888, function () {
//     console.log('Server Running at http://127.0.0.1:5888');
// });
var listen = require('socket.io')
var io = listen(server)
// app.get('/make:room', function(req, res){
//   myname= req.session.name;
//   var guest=`["${myname}"`
//   conn.query(`select req_name from request where gp_num=${req.params.room} and state=1`,function(err,result1){
//     console.log(result1)
//     //var guest=JSON.parse(result1)
//     for(var count=0; count < result1.length;count++ ){
//      guest = guest+ `," ${result1[count].req_name}"`
//     }
//    guest=guest+"]"
//    console.log(guest)
//   })
//   conn.query(`select id,reqnum from gpitems where id=${req.params.room}`,function(err,result2){
//   console.log(myname,guest,result2[0].id,result2[0].reqnum)
//     conn.query(`insert into chat_room values(NULL,?,?,default,?,?);`,[myname,guest,result2[0].id,result2[0].reqnum+1], function(err,result){
//    if(err)throw err;

//   })
//   })
//  // conn.query(`delete from request where gp_num=${req.params.room}`)
//  conn.query(`update request set state=5 WHERE gp_num=${req.params.room}`)
// res.redirect('/servicegp/myrequest')
// })
var room_id = ''

/*채팅방 열기*/
app.get('/chat/:room', function (req, res) {
    myname = 'bunba'// req.session.name;
    console.log('chating go')
    room_id = req.params.room

    fs.readFile('public/chat/chatroom.html', 'utf8', function (error, history) {
        if (error) console.log(error)
        conn.query(`select * from chat_history where rid='${room_id}'`, function (err1, result1) {
            if (err1) throw err1;
            console.log(result1)
            conn.query(`select * from chat_room where id='${room_id}'`, function (err2, result2) {
                if (err2) throw err2;
                res.send(ejs.render(history, {
                    history: result1, item: result2[0]
                }))
            });

        })
    })
app.put('/chat/:room', function (req, res) {
        console.log('/chat' + req.url + '->' + req.method)
        conn.query('insert into chat_history values(NULL,?,?,?)', [req.params.room, req.body.member, req.body.message], function (err) {
            if (err) console.log(err)
            res.send('')
        })
    })
})
    // io.on('connection', function (socket) {
    //     console.log("되라제발좀")

    //     socket.join(room_id)
    //     io.to(socket.id).emit('enter the user', myname);

    //     socket.on('send message', function (msgObj) {
    //         io.to(room_id).emit('receive message', msgObj);

    //         conn.query('insert into chat_history (id,rid,member,content) values(NULL,?,?,?)', [msgObj.room, msgObj.nknm, msgObj.msg])
    //         console.log(msgObj)
    //     });


    //     socket.on('disconnect', function () {
    //         socket.leave(room_num)
    //     })
    // })

    // exports.foo = (res, req) => {

    //     let socket_id = [];
    //     const io = req.app.get('socketio');

    //     io.on('connection', socket => {
    //         console.log("되라제발좀")

    //         socket.join(room_id)
    //         io.to(socket.id).emit('enter the user', myname);

    //         socket.on('send message', function (msgObj) {
    //             io.to(room_id).emit('receive message', msgObj);

    //             conn.query('insert into chat_history (id,rid,member,content) values(NULL,?,?,?)', [msgObj.room, msgObj.nknm, msgObj.msg])
    //             console.log(msgObj)
    //         });
    //         socket.on('disconnect', function () {
    //             socket.leave(room_num)
    //         })

    //     });
    // }

io.on('connection', function (socket) {
        // var user=request.session.userId;
        // socket.on('send message', function (msgObj) {
        //     io.to(1).emit('receive message', msgObj);

        //     conn.query('insert into chat_history (id,rid,member,content) values(NULL,?,?,?)', [msgObj.room, msgObj.nknm, msgObj.msg])
        //     console.log(msgObj)
        // })

        socket.join(room_id)
        socket.on('client message', function (data) {
            console.log(data)
            
            io.emit('server message', data)
        })

        socket.on('leave', function () {
            socket.leave(1)
        })
    })

