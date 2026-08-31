require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// ==========================================
// 1. CONFIGURACIÓN DE SEGURIDAD (HELMET V3)
// ==========================================
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: '*' })); 

app.route('/')
  .get(function (req, res) {
    res.send('<h1>Servidor Activo</h1>');
  });

// ESTO ES LO QUE LE FALTA A FREECODECAMP PARA VALIDAR LOS TESTS 16 AL 19
try {
  fccTestingRoutes(app);
} catch(e) {
  console.log('Rutas de pruebas no disponibles');
}
    
app.use(function(req, res, next) {
  res.status(404).type('text').send('Not Found');
});

const http = require('http').createServer(app);
const io = require('socket.io')(http);

let players = [];
let item = { x: 100, y: 100, value: 1, id: Date.now() };

io.on('connection', (socket) => {
  const newPlayer = { x: 150, y: 150, score: 0, id: socket.id };
  players.push(newPlayer);
  socket.emit('init', { id: socket.id, players, item });
  socket.broadcast.emit('new-player', newPlayer);

  socket.on('move-player', ({ dir, speed }) => {
    const player = players.find(p => p.id === socket.id);
    if (player) {
      if (dir === 'up') player.y -= speed;
      if (dir === 'down') player.y += speed;
      if (dir === 'left') player.x -= speed;
      if (dir === 'right') player.x += speed;
      io.emit('update-players', players);
    }
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id);
    io.emit('remove-player', socket.id);
  });
});

const portNum = process.env.PORT || 3000;
http.listen(portNum, () => {
  console.log(`Escuchando en el puerto ${portNum}`);
});

module.exports = app;
