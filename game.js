var canvas = document.getElementById('game');
var msgBlock = document.getElementById('msgBlock');
var context = canvas.getContext('2d');
var username = prompt("Приветстую в игре \"Астеройды\"!\nТвоя цель: сбить как можно больше астеройдов за меньшее время\nУправляй мышью, уворачивайся и сбивай астеройды\nПоставить игру на паузу можно с помощью клавиши P (eng)\nУдачи!\n\nВведите своё имя:");
var counter = document.getElementById('counter');  //  счеткик очков
var recTable = document.getElementById('records');  //  таблица рекордов

var i, ship, Timer, points;
var aster = [];
var fire = [];
var expl = [];
var records = [];
var additionalSpeed = 0;
var paused = false;

//localStorage.clear(); 

//загрузка ресурсов
asterimg = new Image();
asterimg.src = 'astero.png';

shieldimg = new Image();
shieldimg.src = 'shield.png';

fireimg = new Image();
fireimg.src = 'fire.png';

shipimg = new Image();
shipimg.src = 'ship01.png';

explimg = new Image();
explimg.src = 'expl222.png';

fon = new Image();
fon.src = 'fon.png';

addEventListener("keyup", function (event) {
	if (event.keyCode == 80)
		paused = !paused;
});

//старт игры
fon.onload = start;

//совместимость с браузерами
var requestAnimFrame = (function () {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 20);
		};
})();

//начальные установки
function init() {
	var count_lives_element = document.getElementById("count_lives");
	count_lives_element.value = 5;

	canvas.addEventListener("mousemove", function (event) {
		ship.x = event.offsetX - 25;
		ship.y = event.offsetY - 13;
	});
	paused = false;
	additionalSpeed = 0;
	Timer = 0;
	ship = { x: 300, y: 300, animx: 0, animy: 0 };
	aster = [];
	points = 0;
	counter.innerHTML = 'Счёт: ' + points;
}

function start() {
	load();
	init();
	game();
}

// сохранить текущий результат в локальные данные
function save() {
	localStorage.setItem("records", JSON.stringify(records));
}

// загрузить текущий результат из локалльных данных
function load() {
	if (localStorage.getItem("records")) {
		records = JSON.parse(localStorage.getItem("records"));
	}
}

// инициализировать таблицу рекордов
function loadRec() {
	recTable.innerHTML = '';
	var tr = document.createElement('tr');
	var td = document.createElement('td'); td.width = 150;
	td.innerHTML = "СЧЁТ"; tr.appendChild(td);
	var td = document.createElement('td');
	td.innerHTML = "ИМЯ"; tr.appendChild(td);
	recTable.appendChild(tr);
	for (var i = 0; i < records.length; i++) {
		var tr = document.createElement('tr');
		for (var j = 0; j < records[i].length; j++) {
			var td = document.createElement('td');
			td.innerHTML = records[i][j];
			tr.appendChild(td);
		}
		recTable.appendChild(tr);
	}
}

// проверить установлен ли новый рекорд
function checkRec() {
	var Inserted = false;
	for (var i = 0; i < records.length; i++) {
		if (records[i][1] == username) {
			if (records[i][0] < points) {
				records[i][0] = points;
			}
			Inserted = true;
		}
	}
	if (!Inserted) {
		records.push([points, username]);
	}
}

function restart() {
	init();
	update();
	render();
}

//основной игровой цикл
function game() {
	if (!paused) {
		update();
		render();
	}
	requestAnimFrame(game);
}

//функция обновления состояния игры
function update() {
	save();
	checkRec();
	loadRec();
	Timer++;

	if (points % 10 == 0 && points != 0) showMessage('Кратно 10 !');
	//спавн астероидов
	if (Timer % 10 == 0) {
		aster.push({
			angle: 0,
			dxangle: Math.random() * 0.2 - 0.1,
			del: 0,
			x: Math.random() * 550,
			y: -50,
			dx: Math.random() * 2 - 1,
			dy: Math.random() * 2 + 1
		});
	}

	// ускорение игры
	if (Timer % 1000 == 0) {
		additionalSpeed += 2;
	}

	//выстрел
	if (Timer % 30 == 0) {
		fire.push({ x: ship.x + 10, y: ship.y, dx: 0, dy: -5.2 });
		fire.push({ x: ship.x + 10, y: ship.y, dx: 0.5, dy: -5 });
		fire.push({ x: ship.x + 10, y: ship.y, dx: -0.5, dy: -5 });
	}

	//движение астероидов
	for (i in aster) {
		aster[i].x = aster[i].x + aster[i].dx;
		aster[i].y = aster[i].y + aster[i].dy + additionalSpeed;
		aster[i].angle = aster[i].angle + aster[i].dxangle;

		//граничные условия (коллайдер со стенками)
		if (aster[i].x <= 0 || aster[i].x >= 550) aster[i].dx = -aster[i].dx;
		if (aster[i].y >= 650) aster.splice(i, 1);

		//проверим каждый астероид на столкновение с каждой пулей
		for (j in fire) {

			if (Math.abs(aster[i].x + 25 - fire[j].x - 15) < 50 && Math.abs(aster[i].y - fire[j].y) < 25) {
				//произошло столкновение

				//спавн взрыва
				expl.push({ x: aster[i].x - 25, y: aster[i].y - 25, animx: 0, animy: 0 });

				//помечаем астероид на удаление
				aster[i].del = 1;
				fire.splice(j, 1); break;
			}
		}

		// проверка столкновения корабля с астеройдом
		if (Math.abs(aster[i].x + 25 - ship.x - 25) < 50 && Math.abs(aster[i].y - ship.y) < 25) {

			var count_lives_element = document.getElementById("count_lives");
			var count_lives = Number.parseInt(count_lives_element.value);
			if (count_lives > 1) {
				//уменьшаем количество жизней на 1
				count_lives_element.value = count_lives - 1;
				//удаляем астероид с которым столкнулся корабль
				aster.splice(i, 1);
			}
			else {
				// смэрть
				paused = true;
				alert("Игра окончена!\nВы набрали " + points + " очков!");
				restart();
				return;
			}
		}

		//удаляем астероиды
		if (aster[i] != null && aster[i].del && aster[i].del == 1) {
			aster.splice(i, 1);
			points += 1;
			counter.innerHTML = 'Счёт: ' + points;
		}
	}

	//двигаем пули
	for (i in fire) {
		fire[i].x = fire[i].x + fire[i].dx;
		fire[i].y = fire[i].y + fire[i].dy;

		if (fire[i].y < -30) fire.splice(i, 1);
	}

	//Анимация взрывов
	for (i in expl) {
		expl[i].animx = expl[i].animx + 0.5;
		if (expl[i].animx > 7) { expl[i].animy++; expl[i].animx = 0 }
		if (expl[i].animy > 7)
			expl.splice(i, 1);
	}

	//анимация щита
	ship.animx = ship.animx + 1;
	if (ship.animx > 4) { ship.animy++; ship.animx = 0 }
	if (ship.animy > 3) {
		ship.animx = 0; ship.animy = 0;
	}
}

function render() {
	//очистка холста (не обязательно)
	context.clearRect(0, 0, 600, 600);
	//рисуем фон
	context.drawImage(fon, 0, 0, 600, 600);
	//рисуем пули
	for (i in fire)
		context.drawImage(fireimg, fire[i].x, fire[i].y, 30, 30);
	//рисуем корабль
	context.drawImage(shipimg, ship.x, ship.y);
	//рисуем щит
	context.drawImage(shieldimg, 192 * Math.floor(ship.animx), 192 * Math.floor(ship.animy), 192, 192, ship.x - 25, ship.y - 25, 100, 100);
	//рисуем астероиды
	for (i in aster) {
		//context.drawImage(asterimg, aster[i].x, aster[i].y, 50, 50);
		//вращение астероидов
		context.save();
		context.translate(aster[i].x + 25, aster[i].y + 25);
		context.rotate(aster[i].angle);
		context.drawImage(asterimg, -25, -25, 50, 50);
		context.restore();
		// context.beginPath();
		// context.lineWidth="2";
		// context.strokeStyle="green";
		// context.rect(aster[i].x, aster[i].y, 50, 50);
		// context.stroke();
	}
	//рисуем взрывы
	for (i in expl)
		context.drawImage(explimg, 128 * Math.floor(expl[i].animx), 128 * Math.floor(expl[i].animy), 128, 128, expl[i].x, expl[i].y, 100, 100);

}

function showMessage(text) {
	for (var i = 0; i < msgBlock.children.length; ++i) {
		if (msgBlock.children[i].textContent == text)
			msgBlock.removeChild(msgBlock.children[i]); // если такое сообщение уже выведено
	}
	var msg = document.createElement('message');
	msg.className = 'message';
	msg.innerHTML = text;

	msgBlock.appendChild(msg);
	msg.classList.add('b-show');

	setTimeout(hideMessage, 4000, msg);
	setTimeout(deleteMessage, 5000, msg);
}

function deleteMessage(msg) {
	msgBlock.removeChild(msg);
}

function hideMessage(msg) {
	msg.classList.add('b-hide');
}