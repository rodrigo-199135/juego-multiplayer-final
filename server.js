require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// CONFIGURACIÓN DE SEGURIDAD (HELMET V3)
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' })); 

app.route('/').get((req, res) => {
  res.send('<h1>Servidor de Juego Multijugador Seguro Activo</h1><p>Las cabeceras de Helmet estan configuradas correctamente.</p>');
});
    
app.use((req, res) => { res.status(404).send('Not Found'); });

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
http.listen(portNum, () => { console.log(`Escuchando en el puerto ${portNum}`); });

module.exports = app;
