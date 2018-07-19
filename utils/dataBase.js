module.exports = {
  insertDataBase: insertDataBase,//插入数据库
}

// 计算起点到终点的航向角
function insertDataBase(latitude, longitude) {
  var mysql = require('http://localhost:3306/test');  
 
  var connection = mysql.createConnection({     
    host     : 'localhost',       
    user     : 'root',              
    password : '123456',       
    port: '3306',                   
    database: 'test', 
  }); 
  
  connection.connect();
  
  var addSql = 'INSERT INTO T_test(Id,latitude,longitude) VALUES(0,?,?)';
  var addSqlParams = [latitude, longitude];
  //增
  connection.query(addSql,addSqlParams,function (err, result) {
          if(err){
          console.log('[INSERT ERROR] - ',err.message);
          return;
          }        
  
        console.log('--------------------------INSERT----------------------------');
        //console.log('INSERT ID:',result.insertId);        
        console.log('INSERT ID:',result);        
        console.log('-----------------------------------------------------------------\n\n');  
  });
  
  connection.end();
}









