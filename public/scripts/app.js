// public/scripts/app.js
const socket = io('https://your-websocket-server.herokuapp.com');

const canvas = document.getElementById('canvas');

canvas.addEventListener('click', (event) => {
  const x = event.clientX;
  const y = event.clientY;
  const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const clickData = { x, y, color };
  drawCircle(clickData);
  socket.emit('click', clickData);
});

socket.on('click', (data) => {
  drawCircle(data);
});

function drawCircle({ x, y, color }) {
  const circle = document.createElement('div');
  circle.style.position = 'absolute';
  circle.style.width = '20px';
  circle.style.height = '20px';
  circle.style.borderRadius = '50%';
  circle.style.backgroundColor = color;
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;

  canvas.appendChild(circle);
}
