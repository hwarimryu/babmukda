module.exports=function(express,conn){
var router = express.Router();

// 파일 업로드 모듈 설정
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'img/gp') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
    }
})
var upload = multer({
    storage: storage,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
});
/*1. 공동구매중개 첫 페이지
    - URL : :3000/servicegp
    - 목록나옴-> 누르면 detail보여줌. */
router.get('/', function (req, res) {
    console.log('/servicegp' + req.path)
    res.render('gp/main_gp',{})
});
router.get('/allitems', function (request, response) {
    // 데이터베이스 요청을 수행합니다.
    conn.query("SELECT id,title,name,image,reqnum,maxnum,date_format(date, '%Y-%m-%d')date FROM gpitems order by id desc", function (error, data) {
        response.send(data);
        if (error) {
            console.log(error)
        }
    });
});
/*공동구매품목등록*/
/*1.page - URL : :3000/servicegp/add*/
router.get('/add', function (req, res) {
    console.log('/servicegp' + req.path + ' -> ' + req.method)
    res.render('gp/add_gp',{})
});

/*2.process- URL : :3000/servicegp/add*/
router.post('/add', upload.single('image'), function (req, res) {
    //입력값 limit은 5이하
    console.log('/servicegp' + req.path + ' -> ' + req.method)
    var post = req.body
    var title = post.title
    var name = post.name
    var price = post.price
    var addr = post.addr
    var details = post.details
    var photo
    var host = req.session.userId
    var maxnum = post.maxnum

    if (5 < maxnum) { return res.end('limit : under 6') }
    //id, reqnum은 자동       
    if(!req.file){
        photo='no_image.png'
    }else{
        photo = req.file.filename
    }
    conn.query(`insert into gpitems values(NULL,?,?,?,?,?,default,?,?,?,default,default)`, [title, name, price, addr,maxnum, details, photo, host], function (err, result) {
        console.log(result)
        if (err) throw err;
        else{
            console.log(result)
            res.redirect(`/servicegp/${result.insertId}`)
        }
    })
});

/* 항목하나 상세보기 페이지
    - URL : :3000/servicegp/id
    - 목록나옴-> 누르면 detail보여줌. */
var tempItem
router.get('/:id', function (req, res) {
    var gpId = req.params.id
    console.log('/servicegp' + req.path)

    conn.query("SELECT id,title,name,price,addr,image,reqnum,maxnum,date_format(date, '%Y-%m-%d')date,host,details FROM gpitems where id=?",
            [gpId], function (error, result) {
                if (error) console.log(error)
                tempItem = result[0]

                res.render('gp/detail_gp',{
                    item: result[0],
                    userId:req.session.userId
                })
            });


});
/*공동구매품목수정*/
/*1.page - URL : :3000/servicegp/edit/id*/
router.get('/edit/:id', function (req, res) {
    console.log('/servicegp' + req.path)
    res.render('gp/edit_gp',{
        item: tempItem
    })
})

/*2.process- URL : :3000/servicegp/edit/id*/
router.put('/edit/:id', upload.single('image'), function (req, res) {
    console.log('/servicegp' + req.path + '->' + req.method)
    var post = req.body;
    var id = req.params.id
    var title = post.title
    var name = post.name
    var price = post.price
    var addr = post.addr
    var details = post.details
    var photo
    var maxnum = post.maxnum

    if (5 < maxnum) { return res.end('limit : under 6') }

    if(req.file){
        photo = req.file.filename
        conn.query(`update gpitems set title=?,name=?,price=?,addr=?,details=?,image=?,maxnum=? where id=?`, [title, name, price, addr, details, photo, maxnum, id], function (err, result) {
            if (err) console.log(err);
            res.redirect(`/servicegp/${id}`)
        })
    }else{
        conn.query(`update gpitems set title=?,name=?,price=?,addr=?,details=?,maxnum=? where id=?`, [title, name, price, addr, details,  maxnum, id], function (err, result) {
            if (err) console.log(err);
            res.redirect(`/servicegp/${id}`)
        })
    }
})

    /*공동구매품목삭제
        - URL : :3000/servicegp/delete/id
        - 삭제 눌렀을 때 지워지고 내가등록한 gp 있는 곳으로 감*/
    router.get('/delete/:id', function (req, res) {
        console.log('/servicegp' + req.path)
        conn.query("delete from gpitems where id=?", [req.params.id], function (err) {
            if (err) console.log(err)
            res.redirect(`/myinfo`)
        })
    })

    /*공동구매 신청*/
    router.get('/request/:id',function(req,res){
        // client가 꽉찼는 지 확인하기
        //공동구매신청.
        var filteredID = req.params.id;
        console.log(`3000/servicegp/request/${filteredID}`)
        
        var sql=`INSERT INTO request values(null,'${filteredID}','${req.session.userId}',0,'${tempItem.host}')`;
        conn.query(sql,function(err,result){
            if(err) throw err;
            res.redirect(`/servicegp/${filteredID}`)
            
        })
    })
    /*공동구매 신청취소*/
    router.get('/cancle_req/:id',function(req,res){
        // client가 꽉찼는 지 확인하기
        //공동구매신청.
        var filteredID = req.params.id
        console.log(`3000/servicegp/cancle_req/${filteredID}`)
        var sql=`DELETE FROM request WHERE id ='${filteredID}' and member='${req.session.userId}'`
        conn.query(sql,function(err,result){
            if(err) throw err;
            res.redirect(`/alarm`)
            
        })
    })
/*공동구매 수락*/
    router.get('/accept_req/:id/',function(req,res){

        conn.query(`update request set state=1 WHERE id ='${req.params.id}'`,function(err,result){
            if(err) throw err
            let gpid;
            conn.query(`select gpid from request WHERE id ='${req.params.id}'`,function(err,result){
                gpid=result[0].gpid
                conn.query(`select reqnum from gpitems where id='${gpid}'`, function(err,result){
                    if(err) throw err;
                    var plus = result[0].reqnum+1;
                    conn.query(`update gpitems set reqnum='${plus}' where id='${gpid}'`,function(err,result){
                        if(err) throw err;
                        res.redirect(`/alarm`)
                    })
                })
            })
        });
    })

    /*공동구매 거절*/
    router.get('/refuse_req/:id',function(req,res){
        console.log(req.params.id)

        var sql=`DELETE FROM request WHERE id ='${req.params.id}'`;
        conn.query(sql,function(err,result){
        if(err) throw err;
        console.log(result)
        res.redirect(`/alarm`);

        });
    })

    /*공동구매(채팅방) 종료*/
    router.get('/cancle_gp/:id',function(req,res){
        console.log('/servicegp/gp_cancle/:id')
        //채팅방 취소될 때 신뢰도 table에 rid, [점수 아직 사람들],[점수 받을 사람들],남은 명수 입력
    //신뢰도 입력할 때 남은명수 ==1 인지 확인&0이면 채팅방이랑 신뢰도 테이블에서 삭제
    //0아니면 점수아직사람들에 자기 이름 있으면 채팅방 목록에 나오고 없으면 안나오게!
        conn.query(`update chat_room set state=2 where id=${req.params.id}`,function(err,result){
            if(err) throw err;
        }) 

        conn.query( `select m.member,c.id rid from chat_room as c, chat_member as m where c.id=${req.params.id}; `,function(err,result){
            console.log(result)
            if(err) throw err;
            result.forEach(element => {
                conn.query( `insert into trust values(?,?,default,NULL);`,[element.rid,element.member])
            });
        })

        // conn.query( `select c.guest,g.name from chat_room as c, gpitems as g where c.id=${req.params.id}; `,function(err,result){
        
        //     if(err) throw err;
        //     conn.query( `insert into trust values(?,?,?,NULL);`,[req.params.id,result[0].guest,result[0].guest])
        // })
    
        //db.query(`delete from gpitems where id= ${gpid};`)
        //db.query(`delete from chat_room where rid= ${req.params.id};`)

        res.redirect(`/mychat`)
    })


return router;
}
