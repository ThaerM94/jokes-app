require('dotenv').config();
const express = require('express')
const pg = require('pg')
const superagent = require('superagent');
var methodOverride = require('method-override')

///////main/////
const app = express();
const PORT = process.env.PORT || 3000
const client = new pg.Client(process.env.DATABASE_URL)
/////uses///
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs')
///////listen/////
client.connect()
.then(()=>{
    app.listen(PORT,()=>{
        console.log('i am running');
    })
})

/////////routs//////////
app.get(notFoundHandler)
app.get(errorHandler)
app.get('/',indexHandler)
app.get('/add',addHandler)
app.get('/fav',favHandler)
app.get('/details/:id',detailsHandler)
app.put('/update/:id',updateHandler)
app.put('/delete/:id',deleteHandler)


///////handlers/////
function indexHandler (req,res){
    let {id,type,setup,punchline}=req.query
    let url = `https://official-joke-api.appspot.com/jokes/programming/ten`
    superagent.get(url)
    .then(result=>{
        let joks = result.body.map(val=>{
            return new Jokers(val)
        })
        res.render('index',{data:joks})
    })
}


//////////////addHandler
function addHandler (req,res){
    let {type,setup,punchline}=req.query
    let sql = `INSERT INTO joke (type,setup,punchline)
    VALUES ($1,$2,$3)`;
    let safevalues = [type,setup,punchline]
    client.query(sql,safevalues)
    .then(()=>{
        res.redirect('/fav')
    })
}

/////////favHandler///////
function favHandler(req,res){
    let sql = `SELECT * FROM joke`;
    
    client.query(sql)
    .then(result=>{
        res.render('favorit',{data:result.rows})
    })
}

//////////////detailsHandler///////////
function detailsHandler (req,res){
    let param = req.params.id
    let sql = `SELECT * FROM joke WHERE id=$1`;
    let safevalues = [param]
    client.query(sql,safevalues)
    .then(result=>{
        res.render('details',{data:result.rows[0]})
    })    
}

//////////updateHandler////////////
function updateHandler (req,res){
    let param = req.params.id
    let  {type,setup,punchline}=req.body
    let sql = `UPDATE joke
    SET type = $1, setup = $2, punchline=$3 
    WHERE id=$4;`
    let safevalues =[type,setup,punchline,param];
    client.query(sql,safevalues)
    .then(()=>{
        res.redirect(`/details/${param}`)
    })
}

////////////////////deleteHandler//////
function deleteHandler (req,res){
    let param = req.params.id
    let sql = `DELETE FROM joke WHERE id=$1`;
    let safevalue = [param]
    client.query(sql,safevalue)
    .then(()=>{
        res.redirect('/fav')
    })
}


function Jokers(val){
    this.id=val.id
    this.type=val.type
    this.setup=val.setup
    this.punchline=val.punchline
}


////errorhandlers/////
function notFoundHandler (req,res){
    res.status(404).send('page not found')
}
function errorHandler(err,req,res){
    res.status(500).send(err)
}