const express = require('express');
const bodyParser = require('body-parser');


const PORT = 8081;
const IP = '0.0.0.0';

const app = express();
app.use(bodyParser.text()); 

let cache = {};

app.get('/api/scorm/manifest/:id', (req, res) => {
    console.log(req.params);
    
    // returns manifest url, which lies in the root of scorm course
    res.json({
      manifestUrl : 'https://tb-scorm-lib-akam.c9users.io' + '/resources/' + req.params.id 
    });
    res.end();
});

app.get('/api/scorm/results', (req, res) => {
  console.log('get request, Responce:', cache);
  res.set('Access-Control-Allow-Methods', '*');
  res.set('Access-Control-Allow-Headers', '*');
  res.set("Access-Control-Allow-Origin", "*");  // becouse of PORT difference..
  res.set('Content-Type', 'application/json');
  // cache = {"scorm_stat":{"id":17,"cmiString":"","data":{"total_time":0.0},"success":false,"complete":false,"user_id":1,"scorm_package_id":5,"username":"","email":"","scorm_name":"","time_spent":" \u0026mdash; ","type":"ScormStat","score":0,"score_percent":0,"finished_at":0,"finished_time":" \u0026mdash; "}};
  res.send(JSON.stringify(cache));
  res.end();
});

app.post('/api/scorm/results', (req, res) => {
  cache = JSON.parse(req.body);
  console.log('got post request', cache);
  res.set('Access-Control-Allow-Methods', '*');
  res.set('Access-Control-Allow-Headers', '*');
  res.set("Access-Control-Allow-Origin", "*");  // becouse of PORT difference..
  res.end();
});



const server = app.listen(PORT || 3000, IP || '0.0.0.0', () => {
  const addr = server.address();
  console.log(`Server app listening at ${addr.address}:${addr.port}`);
});