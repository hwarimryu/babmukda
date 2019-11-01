module.exports=function(app,conn){
    var fs = require("fs")

app.get('/myinfo', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    console.log(userId)
    conn.query("SELECT * FROM member where userid=?",[userId], function (error, result) {
        console.log(result[0])
        if (error) console.log(error)
        res.render('myinfo', {
            member: result[0]
        })
    })
})
/*내가 등록한 gp*/
app.get('/myhosting',function(req,res){
    //내가 등록한 gp만
      //URL : :3000/servicegp/myhosting/:userid 
          
      //진행상황 = 성공/취소/ing - 채팅 만들고서!
      console.log('3000/servicegp/myhosting')
      var filteredID =req.session.userId
      conn.query(`select id, title, reqnum,maxnum from gpitems where host='${filteredID}'`,
      function(err,results){
          if(err) throw err;
          console.log(results)
          res.send(results)
      })
  })

  /*내가 등록한 rcp*/
  app.get('/myrcp', function (req, res) {
    console.log(req.url)
    conn.query('select id,title from rcpitems where host=?', [req.session.userId], function (err, result) {
        if (err) console.log(err)
        console.log(result)
        res.send(result)
    })
})

/* gp진행중인거  */
app.get('/alarm', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    console.log(userId)
    res.render('myrequest')
})
/*1. reqnum==maxnum 인 내가 등록한 거-> 채팅방 만들기 할 수 있음.*/
app.get('/myreqfull', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    conn.query(`select *,r.id from request_full r,gpitems g where r.host="${userId}" and g.id=r.gpid`, function (error, result) {
        if (error) console.log(error)
        console.log(result)
        res.send(result)
    })

})
/*2. 내가 등록한 gp 요청 */
app.get('/myreq', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    conn.query(`select *,r.id from request r,gpitems g where r.host="${userId}" and g.id=r.gpid`, function (error, result) {
        if (error) console.log(error)
        console.log(result)
        res.send(result)
    })

})
/*3. 내가 신청한 거-> 신청 취소 할 수 있음*/
app.get('/myreq2', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    conn.query(`select *,r.id from request r,gpitems g where r.member="${userId}" and g.id=r.gpid`, function (error, result) {
        if (error) console.log(error)
        console.log(result)
        res.send(result)
    })

})

/*내 채팅 리스트 */
app.get('/mychat', function (req, res) {
    console.log(req.url)
    userId = req.session.userId
    conn.query(`select * from chat_room r,chat_member m where m.member="${userId}" and r.id=m.rid`, function (error, result) {
        if (error) console.log(error)
        console.log(result)
        res.render('mychat',{
            data:result
        })
        // res.send(result)
    })

})
app.get('/trust/:id',function(req,res){
    console.log('/trust/'+req.params.id)
    //id=room id임
    //trust table 에서 평가대상 사람, 평가를 아직안한사람
    // con
    conn.query(`select * from trust where rid=${req.params.id} and state=0`, function(err,result){
        if(err) throw err;
        // result.forEach(element => {
            console.log(result)
        // });
        // var hi = JSON.stringify(result[0].guest)
        // var h =JSON.parse(result[0].guest) 
        // var a=trust_html.list(h,req.session.name)
        // var html=trust_html.HTML(a,req.params.id);
        // console.log(h[0])
        res.send(result);
    })
    //남은명수 ==1 인지 확인&0이면 채팅방이랑 신뢰도 테이블에서 삭제
//if()
})
app.post('/trust_success',function(req,res){
    var post = req.body;
    console.log(post)
    // if(post.num==1){
    //     conn.query(`update guest set point=point+${post.point} where name="${post.pname}"`,
    //     function(err,result){
    //         if(err) throw err;
    //         // conn.query(`delete from testtt where rid=${req.params.rid} and ppl="${req.session.name}"`)
    //         conn.query(`update trust set state=1 where rid=${post.rid} and yet='${req.session.userId}' `)
    //         // conn.query(`delete from chat_room where rid=${req.params.rid} and tnum=0`)

    //     })
    // }else{

        for(let i=0;i<post.pname.length;i++){
            console.log(post)

            conn.query(`update member set reliability=reliability+${post.point[i]} where name="${post.pname[i]}"`,
            function(err,result){
                if(err) throw err;
                // conn.query(`delete from testtt where rid=${req.params.rid} and ppl="${req.session.name}"`)
                conn.query(`update trust set state=1 where tid=${post.tid[i]}`)
                // conn.query(`delete from chat_room where rid=${req.params.rid} and tnum=0`)

            })
        }

    // post.forEach(element => {
    //     conn.query(`update guest set point=point+${element.point} where name="${element.pname}"`,
    //     function(err,result){
    //         if(err) throw err;
    //         // conn.query(`delete from testtt where rid=${req.params.rid} and ppl="${req.session.name}"`)
    //         conn.query(`update trust set state=1 where rid=${element.rid} and yet='${req.session.userId}' `)
    //         // conn.query(`delete from chat_room where rid=${req.params.rid} and tnum=0`)

    //     })
    // }
    // }

    // if(post.num==1){
    //     conn.query(`update guest set point=point+${post.point} where name="${post.pname}"`,
    //     function(err,result){
    //         if(err) throw err;
    //         // conn.query(`delete from testtt where rid=${req.params.rid} and ppl="${req.session.name}"`)
    //         conn.query(`update trust set state=1 where rid=${post.rid} and yet='${req.session.userId}' `)
    //         // conn.query(`delete from chat_room where rid=${req.params.rid} and tnum=0`)

    //     })

    // }else{
    //     for(let i=0;i<post.num;i++){
    //         console.log(post[i].pname)
    
    //             conn.query(`update guest set point=point+${post[i].point} where name="${post[i].pname}"`,
    //             function(err,result){
    //                 if(err) throw err;
    //                 // conn.query(`delete from testtt where rid=${req.params.rid} and ppl="${req.session.name}"`)
    //                 conn.query(`update trust set state=1 where rid=${post[i].rid} and yet='${req.session.userId}' `)
    //                 // conn.query(`delete from chat_room where rid=${req.params.rid} and tnum=0`)
    
    //             })
       
    //         } 

    // }
    res.redirect(`/mychat`)

})
}