module.exports=function(app,server,conn){
    var listen = require('socket.io')
    var io = listen(server)
    var room_id = ''

    /*채팅방 열기*/
    app.get('/chat/:room', function (req, res) {
        myname = req.session.userId;
        console.log('chating go')
        room_id = req.params.room
        conn.query(`select * from chat_history where rid='${room_id}'`, function (err1, result1) {
            if (err1) throw err1;
            console.log(result1)
            conn.query(`select * from chat_room where id='${room_id}'`, function (err2, result2) {
                if (err2) throw err2;
                conn.query(`select * from gpitems where id='${result2[0].gpid}'`, function (err3, result3) {
                    if (err3) throw err3;
                    console.log(result3)
                    res.render('chatroom',{
                    history: result1, 
                    item: result3[0]
                    })                
                })
            })
        })
    })  
    app.put('/chat/:room', function (req, res) {
            console.log('/chat' + req.url + '->' + req.method)
            conn.query('insert into chat_history values(NULL,?,?,?)', [req.params.room, req.body.member, req.body.message], function (err) {
                if (err) console.log(err)
                res.send('')
            })
        })

    io.on('connection', function (socket) {
        socket.join(room_id)
        socket.on('client message', function (data) {
            console.log(data)
            var message={
                writer:data.member,
                content:data.message
            }
            io.emit('server message', message)
        })
        socket.on('leave', function () {
                socket.leave(1)
        })
    })
}