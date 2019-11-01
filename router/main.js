module.exports=function(app,conn){
    app.get('/', function (req, res) {
        console.log(req.url)
        console.log(req.session.userId)
    
        if (req.session.userId){
            res.render('main',{
                title:"welcome page",
                length:5,
                name:req.session.name,
                userId:req.session.userId
            })
        }else{
            res.redirect('login')
        }
    
    
    });

    /*login */
    app.get('/login', function (req, res) {
         res.render('login');
    })
    app.post('/login', function (req, res) {
        console.log(req.url+ "->"+req.method)
        var userId=req.body.id
        var Password=req.body.password
 
        conn.query('select * from member where userid=?',userId,function(err,result){
            console.log(result)

            if(err){
                console.log(err)
                result["success"] = 0;
                result["error"] = "not found"
                res.redirect('/')
            }else{
                if(Password==result[0].password){
                    console.log(req.session.id)
                    req.session.userId=userId
                    req.session.save(function(){
                        res.redirect('/')
                    })
                }else{
                    result["success"] = 0;
                    result["error"] = "incorrect";
                    res.redirect('/')
                }
            }
        })
    })
/*세션데이터를 삭제 & 로그아웃*/
    app.get('/logout',function(req,res){
    // delete req.session.userId
        if(req.session.userId){
            req.session.destroy(function(err){
                if(err){
                    console.log(err)
                }else{
                    res.redirect('/')
                }
             })
        }
        res.redirect('/')
    })
}