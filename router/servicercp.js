module.exports=function(express,conn){
    var router = express.Router();

    // 파일 업로드 모듈 설정
    var multer = require('multer');
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, 'img/rcp')
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname)
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
        - URL : :3000/servicercp
        - 목록나옴-> 누르면 detail보여줌. */
    router.get('/', function (req, res) {
        console.log('/servicercp' + req.path)
        res.render('rcp/main_rcp',{})
    });
    router.get('/allitems', function (request, response) {
        // 데이터베이스 요청을 수행합니다.
        conn.query("SELECT id,title,image,host,time FROM rcpitems order by id desc", function (error, data) {
            console.log(data)
            response.send(data);
            if (error) {
                console.log(error)
            }
        });
    });
    
    router.get('/add', function (req, res) {
        console.log('/servicercp' + req.path + ' -> ' + req.method)
        res.render('rcp/add_rcp',{})
    });
    router.post('/add', upload.single('image'), function (req, res) {
        console.log('/servicercp' + req.path + ' -> ' + req.method)
        var post = req.body
        var title = post.title
        var photo
        var host = req.session.userId
        var ingredients =post.ingredients
        var process_rcp=post.process
        var time=post.time
        if(!req.file){
            photo='no_image.png'
        }else{
            photo = req.file.filename
        }
        conn.query(`insert into rcpitems values(NULL,?,?,?,?,?,?)`, [title, photo, host, process_rcp, ingredients, time], function (err, result) {
            if (err) throw err;
            console.log(result)
            res.redirect(`/servicercp/${result.insertId}`)
        })
    });

    /*3. 항목하나 상세보기 페이지
        - URL : :3000/servicercp/id
        - 목록나옴-> 누르면 detail보여줌. */
    var tempRcp
    router.get('/:id', function (req, res) {
        var rcpId = req.params.id
        console.log('/servicercp' + req.path)
        conn.query("SELECT id,title,process,image,host,ingredients,time FROM rcpitems where id=?",
            [rcpId], function (error, result) {
            if (error) console.log(error)
            tempRcp = result[0]
            res.render('rcp/detail_rcp',{
                item: result[0],
                userId:req.session.userId
            })
        });
    });
    router.get('/edit/:id', function (req, res) {
        console.log('/servicercp' + req.path)
        res.render('rcp/edit_rcp',{
            item: tempRcp
        })
    })
    router.put('/edit/:id', upload.single('image'), function (req, res) {
        console.log('/servicercp' + req.path + '->' + req.method)
        var post = req.body;
        console.log(post)
        var id = req.params.id
        var title = post.title
        var process_rcp = post.process
        var ingredients = post.ingredients
        var photo

        if(req.file){
            photo = req.file.filename
            conn.query(`update rcpitems set title=?,process=?,image=?,ingredients=? where id=?`, [title, process_rcp, photo, ingredients, id], function (err, result) {
                if (err) console.log(err);
                res.redirect(`/servicercp/${id}`)
            })
        }else{
            conn.query(`update rcpitems set title=?,process=?,ingredients=? where id=?`, [title, process_rcp, ingredients, id], function (err, result) {
                if (err) console.log(err);
                res.redirect(`/servicercp/${id}`)
            })
        }
    })

    //삭제
    router.get('/delete/:id', function (req, res) {
        console.log('/servicercp' + req.path)
        conn.query("delete from rcpitems where id=?", [req.params.id], function (err) {
            if (err) console.log(err)
            res.redirect(`/servicercp`)
        })
    })
    
    router.get('/recommend/:host', function(req,res){
        //fs.readFile('recommend.js', function(error,data){
    
            var m_sql=`select * from member where userid='${req.session.userId}'`;  
            conn.query(m_sql,function(err,result){
               console.log(result)
                var menu1=result[0].recent1;
                var menu2=result[0].recent2;
                var menu3=result[0].recent3;
    
                var sql=`select * from rcpitems where ingredients LIKE '%${menu1}%' or ingredients LIKE '%${menu2}%' or ingredients LIKE '%${menu3}%'`;
                    conn.query(sql,function(err,data){     
                        console.log(data) 
                        res.send(data)
                    }
                );
            });
        });
    return router;
}
