const express = require('express')
const mysql = require('mysql2')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const bodyParser = require('body-parser')
const http = require('http')
const WebSocket = require('ws');
const path = require('path')
const cors = require('cors')

const app = express()
app.use(cors())

let d = new Date();
let year = d.getFullYear();
let month = String(d.getMonth() + 1).padStart(2, "0");
let day = String(d.getDate()).padStart(2, "0");

let date = `${year} เดือน ${month} วันที่ ${day}`;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sunnaga2020',
    database: 'saikaoyimschedule'
});

db.connect((err) => {
    if (err) throw err
    console.log('connected..')
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "public")))
app.use(session({
    secret: "nodesecret",
    resave: false,
    saveUninitialize: true
}))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('home', { role: 'พนักงาน' })
})

app.get('/home', (req, res) => {
    res.render('home', { role: 'พนักงาน' })
})

app.get('/schedule', (req, res) => {
    res.render('schedule')
})

app.get('/area', (req, res) => {
    const sql = "SELECT * FROM schedule ORDER BY room ASC"

    db.query(sql, (err, result) => {
        res.render('area',
            {
                data: result,
                date: date
            }
        )
    })
})

app.get('/roomone', (req, res) => {
    const sql = "SELECT * FROM schedule2 ORDER BY room ASC"

    db.query(sql, (err, result) => {
        res.render('roomone',
            {
                data: result,
                date: date
            }
        )
    })
})

app.get('/roomtwo', (req, res) => {
    const sql = "SELECT * FROM ORDER BY room ASC"

    db.query(sql, (err, result) => {
        res.render('roomtwo',
            {
                data: result,
                date: date
            }
        )
    })
})
app.get('/history', (req, res) => {
    const sql = `
        SELECT * FROM (
            SELECT *, 'schedule' AS source_table, 1 AS table_order FROM schedule
            UNION ALL
            SELECT *, 'schedule2' AS source_table, 2 AS table_order FROM schedule2
            UNION ALL
            SELECT *, 'schedule3' AS source_table, 3 AS table_order FROM schedule3
        ) AS combined
        ORDER BY date ASC,room ASC;
    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('history', {
            data: result
        });
    });
});


app.get('/map', (req, res) => {
    res.render('map')
})

app.get('/admin', (req, res) => {
    res.render('admin')
})

app.get('/gossip', (req, res) => {
    const select = 'SELECT * FROM gossip ORDER BY idgossip asc'

    db.query(select, (err, result) => {

        res.render('gossip',
            {
                dates: date,
                datas: result
            }
        )
    })
})

app.get('/portfolio', (req, res) => {
    res.render('portfolio')
})

app.get('/logout', (req, res) => {
    delete req.session.role;
    res.redirect('/')
})

app.get('/password', (req, res) => {
    res.render('password')
})

app.post('/password', (req, res) => {
    const { password } = req.body

    if (password == 'siramet') {
        req.session.role = 'user';
        res.redirect('/home')
    }
    if (password == 'panus' || password == 'คุณขวัญน่ารักจัง') {
        req.session.role = 'admin';
        res.redirect('/home')
    }

})

app.post('/area', (req, res) => {
    const { room, pass, title } = req.body;
    if (!room || !pass) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูล' });
    }

    const sql = 'INSERT INTO schedule (room, pass, title, date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE pass = VALUES(pass), title = VALUES(title)';
    db.query(sql, [room, pass, title, date], (err, result) => {
        console.log(err)
        if (err) throw err;

        res.redirect('area');

    })
});

app.post('/roomone', (req, res) => {
    const { room, pass, title } = req.body;
    if (!room || !pass) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูล' });
    }

    const sql = 'INSERT INTO schedule2 (room, pass, title, date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE pass = VALUES(pass), title = VALUES(title)';
    db.query(sql, [room, pass, title, date], (err, result) => {
        console.log(err)
        if (err) throw err
        res.redirect('roomone');
    });
});

app.post('/roomtwo', (req, res) => {
    const { room, pass, title } = req.body;
    if (!room || !pass) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูล' });
    }

    const sql = 'INSERT INTO schedule3 (room, pass, title, date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE pass = VALUES(pass), title = VALUES(title)';
    db.query(sql, [room, pass, title, date], (err, result) => {
        if (err) throw err
        res.redirect('roomtwo');
    });
});

app.post('/text', (req, res) => {
    const { text } = req.body

    const insert = 'INSERT INTO gossip (text,time) VALUES (?,?)'
    const select = 'SELECT * FROM gossip ORDER BY idgossip asc'

    if (text != '') {
        db.query(insert, [text, date], (err, result) => {
            db.query(select, (err, result) => {
                res.redirect('/gossip')
            })
        })
    }
    else {
        db.query(select, (err, result) => {
            res.redirect('/gossip')
        })
    }

})
app.listen(3000, () => {
    console.log('started at http://localhost:3000')
})