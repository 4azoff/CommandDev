
const list = document.querySelector(".palying-list");


let level = Number(sessionStorage.getItem("level") || 0);
var recTable = document.getElementById('records'); 
var records = [];

let timerId = null;
let timer = document.querySelector('header .timer');
let curSecond =  sessionStorage.getItem("curSecond") || 10;
timer.innerHTML = 'Оставшееся время: ' + curSecond + ' сек.';

// Ширина секции под квадратики
let width = getComputedStyle(document.querySelector(".playing-field")).getPropertyValue('--size-game-field');
//отезаем пиксели
width = width.substr(0, width.length-2);

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var username = null; 

function save() {
	localStorage.setItem("records", JSON.stringify(records));
}
//localStorage.clear();
// загрузить текущий результат из локалльных данных
function load() {
	if (localStorage.getItem("records")) {
		records = JSON.parse(localStorage.getItem("records"));
		records.sort().reverse();
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
			if (records[i][0] < level) {
				records[i][0] = level;
			}
			Inserted = true;
		}
	}
	if (!Inserted) {
		records.push([level, username]);
	}
}


function nextLevel () {
	load();	
	loadRec();    
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

	let witdhOne = width / (level + 1) - 10;      

    const styleOfSq = `flex: 0 0 auto;
                    width: ${witdhOne}px;
                    height: ${witdhOne}px;
                    border: 1px solid;
                    cursor: pointer;
                    border-radius: 4px;
                    margin: 4px;`;
					
	
    let r = randomInteger(0, 180);
    let g = randomInteger(0, 180);
    let b = randomInteger(0, 180);   
    const n = (level + 1) ** 2;   
    let wellSq = randomInteger(0, n - 1);
	
    for (let i = 0; i < n; i++) {
        let squareElem = document.createElement('li');
        let levelElem = document.querySelector('header .level');
        levelElem.innerHTML = 'Уровень ' + level;

        if (i === wellSq) {
            squareElem.style = `background-color: rgb( ${r + 80 / level}, ${g + 80 / level}, ${b + 80 / level}); ` + styleOfSq;
            squareElem.onclick = function () {
                level++;
                sessionStorage.setItem('level', level.toString());
                    if (timerId == null) {
                        timerId = setInterval(() => {
                            curSecond--;
                            sessionStorage.setItem('curSecond', curSecond.toString());
							
                            timer.innerHTML = 'Оставшееся время: ' + curSecond + ' сек.';
                            if (curSecond === 0) {
                                clearInterval(timerId);
                                username = prompt("Время вышло!\nВаш результат: " + level + " уровней за 10 секунд. \n Введите свое имя:");
                                sessionStorage.clear();								
								checkRec();
								save();								
                                level = 0;
                                curSecond = 10;
                                timerId = null;
                                nextLevel();
                            }
                        }, 1000);
                    }
                nextLevel();
            };
        } else {
            squareElem.style = `background-color: rgb(${r}, ${g}, ${b});` + styleOfSq;
			squareElem.onclick = function () {             
                            
				clearInterval(timerId);
				alert("Вы неправильно выбрали квадратик, игра окончена!\n");
				sessionStorage.clear();				
												
				level = 0;
				curSecond = 10;
				timerId = null;
				nextLevel();                       
                    
               
            };
			
        }

        if (level === 0) {
            squareElem.innerHTML = '<div style="font-size: 2rem; display: flex; justify-content: center; color: red">Для начала игры кликните тут</div>';
            timer.innerHTML = 'Оставшееся время: ' + curSecond + ' сек.';
			
        }

        list.append(squareElem);
    }
}
loadRec();
load();
nextLevel();
