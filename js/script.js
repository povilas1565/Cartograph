let mouse_mode = 0; //Переменная-показатель, определяющий, нажата ли мышка.

let map = { //Объект, в котором хранится вся информация о маршруте. Названия переменных сжаты для конвертации в формат JSON.

    name: "",//Название маршрута.
    inf1: '',//Название области/края/региона.
    inf2: '',//Название города.
    inf3: '',//Название района города.
    inf4: '',//Примечания.

    cx: 0,//Расположение камеры по оси X.
    cy: 0,//Расположение камеры по оси Y.
    vx: 96,//Величина обзора по оси X.
    vy: 54,//Величина обзора по оси Y.

    crd: 0,//Индекс дороги, с которой работает пользователь.
    rd: [],//Массив дорог.
    rdq: 0,//Количество дорог.
    rdnd: 0,//Последующее направление дороги.

    chs: -1,//Индекс сооружения, с которым работает пользователь.
    hs: [],//Массив сооружений.
    hsq: 0,//Количество сооружений.

    pinf1: '',//Название отправной точки "А".
    pinf2: '',//Примечания отправной точки "А".
    px: 0,//Расположение отправной точки "А" по оси X.
    py: 0,//Расположение отправной точки "А" по оси Y.
    pd: 0,//Направление дороги от отправной точки "А".
    ps: 3,//Величина иконки отправной точки "А" на карте.

    epinf: "",//Название конечной точки.
    epx: 0,//Расположение конечной точки по оси X.
    epy: 0,//Расположение конечной точки по оси Y.

    unam: 'Я',//Символ, обозначающий пользователя на карте.
    ucol: 'red',//Цвет значка, обозначающего пользователя на карте.
    ux: 50,//Расположение пользователя по оси X.
    uy: 20,//Расположение пользователя по оси Y.
    us: 3,//Величина иконки пользователя на карте.

    mode: 1,//Стадия заполнения маршрута.
    bc: [0, 0, 0, 0],//Хранит информацию о том, какие кнопки были нажаты.
};

let info_opened = false;//Определяет, открыта ли информация о маршруте.
let point_opened = false;//Определяет, открыта ли информация об отправной точке "А".
let house_opened = false;//Определяет, открыта ли информация о сооружении, с которым работает пользователь.

let mobile_point_1;//Координаты нажатия пальцем по экрану.
let mobile_point_2;//Координаты отпускания пальца от экрана.

let objects_moved = new Map();//Хранит информацию об объектах, находящихся в движении во время анимации.
let color_map = new Map();//Хранит цвета.
let input_max_length = new Map();//Хранит максимальное количество символов в полях для ввода.

let objects_moving = 0;//Количество объектов в движении во время анимации.

let last_clicked = "body";//Последний нажатый объект.
let input_clicked = "";//Последнее нажатое поле для ввода.

let hidden_y = 1300;//Положение объекта на оси Y, при котором он скрыт.

window.onscroll = () => { //Функция для предотвращения прокрутки на странице
    window.scroll(0, 0);
};
window.onkeypress = function (e) { //Обработка нажатий клавиш. При нажатии на клавишу Enter, пользователь переходит в следующий пункт.
    if (e.key === "Enter") {
        Next(1);
    }
};
window.onmousedown = function () { //Обработка нажатий на экран.
    if (last_clicked !== input_clicked && input_clicked !== "") {
        UnclickInput(); //Если пользователь нажмёт мимо выделенного поля для ввода, оно перестанет выделяться.
    }
    last_clicked = "body";
    mouse_mode = 1;
};
window.onmouseup = function () { //Обработка отпускания нажатия на экране.
    mouse_mode = 0;
};
window.onmousemove = function (e) { //Обработка передвижения мыши на экране.
    if (mouse_mode === 1) {
        if (e.clientX >= 630) {
            let values = SafeInputValues();
            Camera(-e.movementX * (map.vx / 96) / 20, -e.movementY * (map.vy / 54) / 20);
            SetInputValues(values); //Если мышь при этом зажата, происходит перемещение поля обзора.
        }
    }
};

window.onwheel = function (e) { //Обработка прокрутки мыши
    let values = SafeInputValues();
    View(e.deltaY / 5);
    SetInputValues(values); //Изменяется поле обзора
};
window.onload = function () {
    document.addEventListener('touchstart', (e) => {
        if (e.changedTouches[0].pageX >= 630) {
            mobile_point_1 = e.changedTouches[0]; //При опускании пальца сохраняется координата на экране.
        }
    });
    document.addEventListener('touchend', (e) => {
        if (e.changedTouches[0].pageX >= 630) {
            mobile_point_2 = e.changedTouches[0];  //При оподъёме пальца сохраняется координата на экране.
            ShortMoveCamera((mobile_point_1.pageX - mobile_point_2.pageX) * (map.vx / 96) / 20, (mobile_point_1.pageY - mobile_point_2.pageY) * (map.vy / 54) / 20); //Происходит перемещение поля обзора по направлению перемещения пальца.
        }
    });

    color_map.set(4, "gray");
    color_map.set(5, "#f2554c");
    color_map.set(6, "orange");
    color_map.set(7, "#FFBA00");
    color_map.set(8, "#1ac174");
    color_map.set(9, "cyan");
    color_map.set(10, "blue");
    color_map.set(11, "purple");
    color_map.set(12, "white"); //Предварительное сохранение палитры цветов.

    GetElement("back_div").style.width = (630) + "px";
    GetElement("back_div").style.height = (1080) + "px"; //Установка параметров фона интерфейса.

    CreateButton("main_text", 650, 10, 300, 50, "Маршрут : ", "OpenInfo();", 20, "white", "white"); //Далее расстановка элементов интерфейса при помощи методов.
    for (let i = 1; i < 12; i++) {
        CreateText("info_text_" + i, 10, -hidden_y * 1.1, 12, "", "#d3d3d3", "#d3d3d3");
        GetElement("info_text_" + i).style.width = 200 + "px";
        GetElement("info_text_" + i).style.opacity = 80 + "%";
    }
    CreateText("answer_text_big", 10, -hidden_y * 1.1, 20, "Укажите отправную точку А на карте:");
    CreateText("answer_text_small", 10, -hidden_y * 1.1, 20, "Укажите цвет дороги:");
    CreateButton("button_next", 450, 125, 150, 40, "Далее", "Next(1)", 15, color_map.get(7), color_map.get(7));
    CreateButton("button_back", 10, -hidden_y * 1.1, 150, 40, "Назад", "Next(-1)", 15, color_map.get(7), color_map.get(7));
    CreateButton("button_load", 960, 10, 150, 35, "Загрузить", "Load('safe');", 10, "white", "white");
    CreateGoodInput("input_1", 10, 60, 30, 40, 20, 20, "Введите название маршрута:");
    CreateButton("button_plus", 960, 50, 60, 60, "+", "ShortMoveView(-20);", 40, "white", "white");
    CreateButton("button_minus", 1050, 50, 60, 60, "-", "ShortMoveView(20);", 40, "white", "white");
    CreateGoodInput("input_2", 10, -hidden_y * 1.1, 30, 40, 20, 20, "Название города/населенного пункта:");
    CreateGoodInput("input_3", 10, -hidden_y * 1.1, 30, 40, 20, 20, "Район города/области:");
    CreateGoodInput("input_4", 10, -hidden_y * 1.1, 30, 40, 20, 20, "Примечания:");
    CreateMap(0, 0, 1920, 1080, 50, 50, 1, 1);
    for (let button_index = 0; button_index <= 12; button_index++) {
        CreateButton("button_" + button_index, 10, -hidden_y * 1.1, 40, 40, "А", "Change(" + button_index + ")", 1, color_map.get(7), color_map.get(7));
    }
    GetElement("button_1").style.zIndex = "4";
    GetElement("button_2").style.zIndex = "4";
    GetElement("button_3").style.zIndex = "4";
    GetElement("button_4").style.zIndex = "4";
    Check(); //Запуск функции, обрабатывающей условия и считывающей некоторые действия пользователя.
};

function UpdateMap() { //Обновление карты (прорисовка).
    let point_opened_2 = point_opened; //Сохранение значений переменных (открыта ли информация о начальной точке или о здании).
    let house_opened_2 = house_opened;
    if (point_opened_2) {//Закрываем информацию, если она была открыта до отрисовки карты.
        OpenPoint(true);
    }
    if (house_opened_2) {
        OpenHouse(true);
    }
    let bw = 1920 / map.vx;//Переменные, обозначающие размер в реальных пикселях одной условной единицы измерения площади.
    let bh = 1080 / map.vy;
    for (let road_index = 0; road_index < map.rd.length; road_index++) { //Перебираем все объекты дорог в массиве.
        if (map.rd[road_index] != null) {//Проверяем, существует ли такая дорога.
            let dir = map.rd[road_index].dir;//Сохраняем параметры дороги.
            let object_left = map.rd[road_index].object_left;
            let object_right = map.rd[road_index].object_right;
            let color = map.rd[road_index].color;
            let background_color = map.rd[road_index].background_color;
            let name = map.rd[road_index].name;
            let x = map.rd[road_index].x - map.cx;
            let y = map.rd[road_index].y - map.cy;
            let width = map.rd[road_index].width;
            let length = map.rd[road_index].length;
            let x1 = map.rd[road_index].x;
            let y1 = map.rd[road_index].y;
            let w1, h1;
            if (dir === 1 || dir === 3) { //Обозначение длины и ширины дороги в зависимости от её направления.
                w1 = map.rd[road_index].width;
                h1 = map.rd[road_index].length;
            }
            if (dir === 2 || dir === 4) {
                w1 = map.rd[road_index].length;
                h1 = map.rd[road_index].width;
            }
            if (IsView(x1, y1, w1, h1)) { //Если дорога в области обзора.
                if (GetElement("road_" + road_index) == null) { //Если элемент, отображающий дорогу не существует.
                    if (dir === 2 || dir === 4) { //Прорисовываем дорогу, название дороги и ориентиры дороги.
                        document.body.innerHTML += "<div class='element' id='road_" + road_index + "' style='left:" + x * bw + "px;top:" + (y * bh) + "px;width:" + (length * bw) + "px;height:" + (width * bh) + "px;z-index:1;  background: linear-gradient(0deg, " + background_color + " , " + background_color + ", " + background_color + ");'></div>";
                        document.body.innerHTML += "<div class='element' id='road_name_" + road_index + "' style='left:" + x * bw + "px;top:" + (y * bh) + "px;width:" + (length * bw) + "px;height:" + (width * bh) + "px;z-index:2;  font-size:" + Math.ceil(30 * (96 / map.vx)) + "px;text-align:center;justify-content: center;display: flex;align-items: center; color:" + color + ";'>" + name + "</div>";
                        if (dir === 2) {
                            document.body.innerHTML += "<div class='element' id='road_object_left_" + road_index + "' style='left:" + (x * bw) + "px;top:" + ((y - 16) * bh) + "px;width:" + (20 * bw) + "px;height:" + (width / 2 * bh) + "px;z-index:2;  font-size:" + Math.ceil(20 * (96 / map.vx)) + "px;text-align:center;justify-content: center;display: flex;align-items: center;  background-color:#d3d3d3;border: 1px, hidden,gray;border-radius:2px;opacity:80%;color:" + color + ";'>" + object_left + "</div>";
                            document.body.innerHTML += "<div class='element' id='road_object_right_" + road_index + "' style='left:" + (x * bw) + "px;top:" + ((y + 16) * bh) + "px;width:" + (20 * bw) + "px;height:" + (width / 2 * bh) + "px;z-index:2;  font-size:" + Math.ceil(20 * (96 / map.vx)) + "px;text-align:center;justify-content: center;display: flex;align-items: center; background-color:#d3d3d3;border: 1px, hidden,gray;border-radius:2px;opacity:80%; color:" + color + ";'>" + object_right + "</div>";
                        }
                        if (dir === 4) {
                            document.body.innerHTML += "<div class='element' id='road_object_left_" + road_index + "' style='left:" + (x * bw) + "px;top:" + ((y + 16) * bh) + "px;width:" + (20 * bw) + "px;height:" + (width / 2 * bh) + "px;z-index:2;  font-size:" + Math.ceil(20 * (96 / map.vx)) + "px;text-align:center;justify-content: center;display: flex;align-items: center;  background-color:#d3d3d3;border: 1px, hidden,gray;border-radius:2px;opacity:80%;color:" + color + ";'>" + object_left + "</div>";
                            document.body.innerHTML += "<div class='element' id='road_object_right_" + road_index + "' style='left:" + (x * bw) + "px;top:" + ((y - 16) * bh) + "px;width:" + (20 * bw) + "px;height:" + (width / 2 * bh) + "px;z-index:2;  font-size:" + Math.ceil(20 * (96 / map.vx)) + "px;text-align:center;justify-content: center;display: flex;align-items: center; background-color:#d3d3d3;border: 1px, hidden,gray;border-radius:2px;opacity:80%; color:" + color + ";'>" + object_right + "</div>";
                        }
                    }
                    if (dir === 1 || dir === 3) {
                        document.body.innerHTML += "<div class='element' id='road_" + road_index + "' style='left:" + (x * bw) + "px;top:" + (y * bh) + "px;width:" + (width * bw) + "px;height:" + (length * bh) + "px;z-index:1;  background: linear-gradient(90deg, " + background_color + " , " + background_color + ", " + background_color + ");'></div>";
                        document.body.innerHTML += "<div class='element' id='road_name_" + road_index + "' style='left:" + ((x * bw) - ((length / 2) * bh) + ((width / 2) * bw)) + "px;top:" + ((y * bh) + ((length / 2) * bh) - ((width / 2) * bw)) + "px;width:" + (length * bh) + "px;height:" + (width * bw) + "px;z-index:2;  font-size:" + Math.ceil(30 * (96 / map.vx)) + "px;text-align:center;justify-content: center;display: flex;align-items: center; color:" + color + ";transform:rotate(90deg);'>" + name + "</div>";
                        if (dir === 1) {
                            document.body.innerHTML += "<div class='element' id='road_object_left_" + road_index + "' style='left:" + (((x - 16) * bw)) + "px;top:" + ((y * bh) + ((length / 2) * bh) - ((width / 2) * bw)) + "px;width:" + (20 * bh) + "px;height:" + (width / 2 * bw) + "px;z-index:2;  font-size:" + Math.ceil(20 * (96 / map.vx)) + "px;text-align:center;justify-content: center;display: flex;align-items: center; background-color:#d3d3d3 ;border: 1px, hidden,gray;border-radius:2px;opacity:80%; color:" + color + ";transform:rotate(90deg);'>" + object_left + "</div>";
                            document.body.innerHTML += "<div class='element' id='road_object_right_" + road_index + "' style='left:" + (((x + 16) * bw)) + "px;top:" + ((y * bh) + ((length / 2) * bh) - ((width / 2) * bw)) + "px;width:" + (20 * bh) + "px;height:" + (width / 2 * bw) + "px;z-index:2;  font-size:" + Math.ceil(20 * (96 / map.vx)) + "px;text-align:center;justify-content: center;display: flex;align-items: center; background-color:#d3d3d3 ;border: 1px, hidden,gray;border-radius:2px;opacity:80%; color:" + color + ";transform:rotate(90deg);'>" + object_right + "</div>";
                        }
                        if (dir === 3) {
                            document.body.innerHTML += "<div class='element' id='road_object_left_" + road_index + "' style='left:" + (((x + 16) * bw)) + "px;top:" + ((y * bh) + ((length / 2) * bh) - ((width / 2) * bw)) + "px;width:" + (20 * bh) + "px;height:" + (width / 2 * bw) + "px;z-index:2;  font-size:" + Math.ceil(20 * (96 / map.vx)) + "px;text-align:center;justify-content: center;display: flex;align-items: center;  background-color:#d3d3d3 ;border: 1px, hidden,gray;border-radius:2px;opacity:80%;color:" + color + ";transform:rotate(90deg);'>" + object_left + "</div>";
                            document.body.innerHTML += "<div class='element' id='road_object_right_" + road_index + "' style='left:" + (((x - 16) * bw)) + "px;top:" + ((y * bh) + ((length / 2) * bh) - ((width / 2) * bw)) + "px;width:" + (20 * bh) + "px;height:" + (width / 2 * bw) + "px;z-index:2;  font-size:" + Math.ceil(20 * (96 / map.vx)) + "px;text-align:center;justify-content: center;display: flex;align-items: center;  background-color:#d3d3d3 ;border: 1px, hidden,gray;border-radius:2px;opacity:80%;color:" + color + ";transform:rotate(90deg);'>" + object_right + "</div>";
                        }
                    }
                } else {//Если элемент, отображающий дорогу существует.
                    if (dir === 2 || dir === 4) {//Редактируем и меняем положение дороги.
                        EditObject("road_" + road_index, (x * bw), (y * bh), (length * bw), (width * bh));
                        EditObject("road_name_" + road_index, (x * bw), ( y * bh), (length * bw), (width * bh), Math.ceil(30 * (96 / map.vx)));
                        if (dir === 2) {
                            EditObject("road_object_left_" + road_index, (x * bw), ( (y - 16) * bh), (20 * bw), (width / 2 * bh), Math.ceil(20 * (96 / map.vx)));
                            EditObject("road_object_right_" + road_index, (x * bw), ( (y + 16) * bh), (20 * bw), (width / 2 * bh), Math.ceil(20 * (96 / map.vx)));
                        }
                        if (dir === 4) {
                            EditObject("road_object_left_" + road_index, (x * bw), ((y + 16) * bh), (20 * bw), (width / 2 * bh), Math.ceil(20 * (96 / map.vx)));
                            EditObject("road_object_right_" + road_index, (x * bw), ((y - 16) * bh), (20 * bw), (width / 2 * bh), Math.ceil(20 * (96 / map.vx)));
                        }
                    }
                    if (dir === 1 || dir === 3) {
                        EditObject("road_" + road_index, (x * bw), (y * bh), (width * bw), (length * bh));
                        EditObject("road_name_" + road_index, ((x * bw) - ((length / 2) * bh) + ((width / 2) * bw)), ((y * bh) + ((length / 2) * bh) - ((width / 2) * bw)), (length * bh), (width * bw), Math.ceil(30 * (96 / map.vx)));
                        if (dir === 1) {
                            EditObject("road_object_left_" + road_index, (((x - 16) * bw)), ((y * bh) + ((length / 2) * bh) - ((width / 2) * bw)), (20 * bh), (width / 2 * bw), Math.ceil(20 * (96 / map.vx)));
                            EditObject("road_object_right_" + road_index, (((x + 16) * bw)), ((y * bh) + ((length / 2) * bh) - ((width / 2) * bw)), (20 * bh), (width / 2 * bw), Math.ceil(20 * (96 / map.vx)));
                        }
                        if (dir === 3) {
                            EditObject("road_object_left_" + road_index, (((x + 16) * bw)), ((y * bh) + ((length / 2) * bh) - ((width / 2) * bw)), (20 * bh), (width / 2 * bw), Math.ceil(20 * (96 / map.vx)));
                            EditObject("road_object_right_" + road_index, (((x - 16) * bw)), ((y * bh) + ((length / 2) * bh) - ((width / 2) * bw)), (20 * bh), (width / 2 * bw), Math.ceil(20 * (96 / map.vx)));
                        }
                    }
                }
            } else {//Если дорога не видна, удаляем её элемент для повышения производительности.
                if (GetElement('road_' + road_index) != null) {
                    GetElement('road_' + road_index).remove();
                }
                if (GetElement('road_name_' + road_index) != null) {
                    GetElement('road_name_' + road_index).remove();
                }
                if (GetElement('road_object_left_' + road_index) != null) {
                    GetElement('road_object_left_' + road_index).remove();
                }
                if (GetElement('road_object_right_' + road_index) != null) {
                    GetElement('road_object_right_' + road_index).remove();
                }
            }
            if (GetElement('road_object_left_' + road_index) != null) {//Если ориентир подписан, прорисовываем. Если же ориентир не подписан, скрываем его.
                if (object_left === "") {
                    GetElement('road_object_left_' + road_index).style.opacity = "0%";
                } else {
                    GetElement('road_object_left_' + road_index).style.opacity = "100%";
                }
            }
            if (GetElement('road_object_right_' + road_index) != null) {
                if (object_right === "") {
                    GetElement('road_object_right_' + road_index).style.opacity = "0%";
                } else {
                    GetElement('road_object_right_' + road_index).style.opacity = "100%";
                }
            }
        }
    }
    for (let house_index = 0; house_index < map.hsq; house_index++) {//Перебираем все объекты домов в массиве.
        let x = map.hs[house_index].x - map.cx;//Сохранение параметров дома.
        let y = map.hs[house_index].y - map.cy;
        let color = map.hs[house_index].color;
        let block = map.hs[house_index].block;
        let name = map.hs[house_index].name;
        if (IsView(x + map.cx, y + map.cy, 10, 10)) {//Если дом расположен в области обзора.
            let cut, xl = x, yl = y;
            if (block !== 0) {//Если здание заполнено (переменная block обозначает иконку).
                if (map.rd[map.hs[house_index].rd].dir === 2 || map.rd[map.hs[house_index].rd].dir === 4) {//Перемещаем дом ближе, чтобы он прилегал крайней точкой к дороге.
                    cut = 0;
                    if (map.hs[house_index].dir === 1) {
                        for (let point_index = 0; point_index < map.hs[house_index].block.length; point_index++) {
                            if (map.hs[house_index].block[point_index].y > cut) {
                                cut = map.hs[house_index].block[point_index].y;//Находим крайнюю точку по оси Y.
                            }
                        }
                        y += 10 - cut - 1;
                    }
                    cut = 10;
                    if (map.hs[house_index].dir === 3) {
                        for (let point_index = 0; point_index < map.hs[house_index].block.length; point_index++) {
                            if (map.hs[house_index].block[point_index].y < cut && map.hs[house_index].block[point_index].y !== -1) {
                                cut = map.hs[house_index].block[point_index].y;//Находим крайнюю точку по оси Y.
                            }
                        }
                        y -= cut;
                    }
                }
                if (map.rd[map.hs[house_index].rd].dir === 1 || map.rd[map.hs[house_index].rd].dir === 3) {
                    cut = 0;
                    if (map.hs[house_index].dir === 4) {
                        for (let point_index = 0; point_index < map.hs[house_index].block.length; point_index++) {
                            if (map.hs[house_index].block[point_index].x > cut) {
                                cut = map.hs[house_index].block[point_index].x;//Находим крайнюю точку по оси X.
                            }
                        }
                        x += 10 - cut - 1;
                    }
                    cut = 10;
                    if (map.hs[house_index].dir === 2) {
                        for (let point_index = 0; point_index < map.hs[house_index].block.length; point_index++) {
                            if (map.hs[house_index].block[point_index].x < cut && map.hs[house_index].block[point_index].x !== -1) {
                                cut = map.hs[house_index].block[point_index].x;//Находим крайнюю точку по оси X.
                            }
                        }
                        x -= cut;
                    }
                }
                let point = 0;
                for (let point_index = 0; point_index < map.hs[house_index].block.length; point_index++) {//Перебираем все точки из иконки.
                    point = map.hs[house_index].block[point_index];//Сохраняем точку.
                    if (point.x !== -1) {//Если точка существует, отрисовываем.
                        CreateRectangle("house_" + house_index + "_" + point_index, point.x + x, point.y + y, point.x + x, point.y + y, color);
                    }
                }
                if (GetElement('house_' + house_index) == null) {//Если элемент, отображающий название здания не существует, создаем его.
                    document.body.innerHTML += "<div class='element' onmouseup='SelectHouse(" + house_index + ")'  id='house_" + house_index + "' style='left:" + (xl * bw) + "px;top:" + (yl * bh) + "px;width:" + (bw * 10) + "px;height:" + (bh * 10) + "px;z-index:2;justify-content: center;display: flex;align-items: center; font-size:" + Math.ceil(20 * (96 / map.vx)) + "px;border: 1px, hidden,gray;' >" + name + "</div>";
                } else {//Если элемент, отображающий название здания существует, меняем его положении и размер.
                    GetElement('house_' + house_index).style.left = (xl * bw) + "px";
                    GetElement('house_' + house_index).style.top = (yl * bh) + "px";
                    GetElement('house_' + house_index).style.width = (bw * 10) + "px";
                    GetElement('house_' + house_index).style.height = (bh * 10) + "px";
                    GetElement('house_' + house_index).style.fontSize = Math.ceil(20 * (96 / map.vx)) + "px";
                }
            } else {//Если здание не заполнено.
                if (GetElement('house_' + house_index) == null) {//Если элемент, отображающий здание не существует, создаем его.
                    document.body.innerHTML += "<div class='element' onmouseup='SelectHouse(" + house_index + ")'   id='house_" + house_index + "' style='left:" + (xl * bw) + "px;top:" + (yl * bh) + "px;width:" + (bw * 10) + "px;height:" + (bh * 10) + "px;z-index:2; justify-content: center;display: flex;align-items: center; font-size:" + Math.ceil(20 * (96 / map.vx)) + "px;background: linear-gradient(0deg,  " + color + ", " + color + ",  " + color + ");border: 1px, hidden,gray;' >" + name + "</div>";
                } else {//Если элемент, отображающий здание существует, меняем его положении и размер.
                    GetElement('house_' + house_index).style.left = (xl * bw) + "px";
                    GetElement('house_' + house_index).style.top = (yl * bh) + "px";
                    GetElement('house_' + house_index).style.width = (bw * 10) + "px";
                    GetElement('house_' + house_index).style.height = (bh * 10) + "px";
                    GetElement('house_' + house_index).style.fontSize = Math.ceil(20 * (96 / map.vx)) + "px";
                }
            }
        } else {//Если дом расположен вне области обзора.
            for (let point_index = 0; point_index < map.hs[house_index].points; point_index++) { //Удаляем все элементы, составляющие его иконку.
                if (GetElement('house_' + house_index + '_' + point_index) != null){
                    GetElement('house_' + house_index + '_' + point_index).remove();
                }
            }
            if (GetElement('house_' + house_index) != null) {//Удаляем элемент здания, или название здания (если существует).
                GetElement('house_' + house_index).remove();
            }
        }
    }
    if (GetElement('point') == null) {//Если элемента, отображающего начальную точку не существует, создаём его.
        document.body.innerHTML += "<div class='element' id='point' style='left:" + ((map.px - map.cx) * bw) + "px;top:" + ((map.py - map.cy) * bh) + "px;width:" + (bw * map.ps) + "px;height:" + (bh * map.ps) + "px;z-index:2;text-align:center; font-size:" + Math.ceil(40 * (96 / map.vx) * map.ps / 2) + "px; color:black;background: linear-gradient(0deg, " + color_map.get(8) + ", " + color_map.get(8) + ");border: 1px, hidden,gray;'  onclick=\"OpenPoint();\">A</div>";
    } else {//Если элемент, отображающий начальную точку существует, меняем его положение и размер.
        GetElement('point').style.left = ((map.px - map.cx) * bw) + "px";
        GetElement('point').style.top = ((map.py - map.cy) * bh) + "px";
        GetElement('point').style.width = (bw * map.ps) + "px";
        GetElement('point').style.height = (bh * map.ps) + "px";
        GetElement('point').style.fontSize = Math.ceil(40 * (96 / map.vx) * map.ps / 2) + "px";
    }
    if (map.epinf !== "") {//Если элемента, отображающего конечную точку не существует, создаём его.
        if (GetElement('end') == null) {
            document.body.innerHTML += "<div class='element' id='end' style='left:" + ((map.epx - map.cx) * bw) + "px;top:" + ((map.epy - map.cy) * bh) + "px;width:" + (bw * 10) + "px;height:" + (bh) + "px; z-index:2;text-align:center; font-size:" + Math.ceil(15 * (96 / map.vx) * map.ps / 2) + "px; color:black;background: linear-gradient(0deg, " + color_map.get(6) + ", " + color_map.get(6) + ");border: 1px, hidden,gray;'  onclick=\"OpenPoint();\">" + map.epinf + "</div>";
        } else {//Если элемент, отображающий конечную точку существует, меняем его положение и размер.
            GetElement('end').style.left = ((map.epx - map.cx) * bw) + "px";
            GetElement('end').style.top = ((map.epy - map.cy) * bh) + "px";
            GetElement('end').style.width = (bw * 10) + "px";
            GetElement('end').style.height = (bh) + "px";
            GetElement('end').style.fontSize = Math.ceil(15 * (96 / map.vx) * map.ps / 2) + "px";
        }
    }
    if (GetElement('user') == null) {//Если элемента, отображающего пользователя на карте не существует, создаём его.
        let ucol = "#d3d3d3";
        if (map.rd[map.crd] != null) {
            ucol = map.rd[map.crd].background_color;
        }
        document.body.innerHTML += "<div class='element' id='user' style='left:" + ((map.ux - map.cx) * bw) + "px;top:" + ((map.uy - map.cy) * bh) + "px;width:" + (bw * map.us) + "px;height:" + (bh * map.us) + "px;z-index:2; text-align:center;background: linear-gradient(0deg, " + ucol + ", " + ucol + ");border: 1px hidden gray; font-size:" + Math.ceil(40 * (96 / map.vx) * map.us / 2) + "px; color:" + map.ucol + ";' >" + map.unam + "</div>";
    } else {//Если элемент, отображающий пользователя на карте существует, меняем его положение и размер.
        GetElement('user').style.left = ((map.ux - map.cx) * bw) + "px";
        GetElement('user').style.top = ((map.uy - map.cy) * bh) + "px";
        GetElement('user').style.width = (bw * map.us) + "px";
        GetElement('user').style.height = (bh * map.us) + "px";
        GetElement('user').style.fontSize = Math.ceil(40 * (96 / map.vx) * map.us / 2) + "px";
    }
    if (point_opened_2) {//Открываем информацию, если она была открыта до отрисовки карты.
        OpenPoint(true);
    }
    if (house_opened_2) {
        OpenHouse(true);
    }
}

function ClearMap() { //Удаляем все элементы на карте, если они существуют.
    for (let road_index = 0; road_index < map.rd.length; road_index++) {
        if (GetElement('road_' + road_index) != null) {
            GetElement('road_' + road_index).remove();
        }
        if (GetElement('road_name_' + road_index) != null) {
            GetElement('road_name_' + road_index).remove();
        }
        if (GetElement('road_object_left_' + road_index) != null) {
            GetElement('road_object_left_' + road_index).remove();
        }
        if (GetElement('road_object_right_' + road_index) != null) {
            GetElement('road_object_right_' + road_index).remove();
        }
    }
    for (let house_index = 0; house_index < map.hsq; house_index++) {
        for (let point_index = 0; point_index < map.hs[house_index].block.length; point_index++) {
            if (GetElement('house_' + house_index + '_' + point_index) != null) {
                GetElement('house_' + house_index + '_' + point_index).remove();
            }
        }
        if (GetElement('house_' + house_index) != null) {
            GetElement('house_' + house_index).remove();
        }
    }
    if (GetElement('point') != null) {
        GetElement('point').remove();
    }
    if (GetElement('user') != null) {
        GetElement('user').remove();
    }
    if (GetElement('end') != null) {
        GetElement('end').remove();
    }
}

function Check() {//Функция, проверяющая условия и обрабатывающая некоторые действия пользователя.
    if (map.mode === 1) { //В зависимости от стадии заполнения маршрута пользователем выполняется разное.
        if (GetElement("input_1").value === '') {
            SetBackground("input_1_description_text", color_map.get(5), color_map.get(5)); //Установка цвета для текста.
            SetBackground("button_next", color_map.get(5), color_map.get(5)); //Установка цвета для кнопки "далее".

        } else {
            SetBackground("input_1_description_text", color_map.get(8), color_map.get(8));
            SetBackground("button_next", color_map.get(8), color_map.get(8));
        }
        map.name = GetElement('input_1').value; //Смена имени маршрута на значения, содержащиеся в поле для ввода.
        GetElement("main_text").innerText = "Маршрут : " + map.name;
    }
    if (map.mode === 2) {
        map.inf1 = GetElement("input_1").value;
        map.inf2 = GetElement("input_2").value;
        map.inf3 = GetElement("input_3").value;
        map.inf4 = GetElement("input_4").value;
        if (info_opened) {//Если информация о маршруте открыта, меняем текст элементов с информацией.
            GetElement("info_text_1").innerText = "Область/край/регион : " + map.inf1;
            GetElement("info_text_2").innerText = "Город/населенный пункт : " + map.inf2;
            GetElement("info_text_3").innerText = "Район : " + map.inf3;
            GetElement("info_text_4").innerText = "Примечания : " + map.inf4;
        }

        for (let input_index = 1; input_index <= 4; input_index++) {//Окрашиваем в цвет элементы, в зависимости от того, заполнено поле или нет.
            if (GetElement("input_" + input_index).value === '') {
                if (input_index !== 4) {
                    SetBackground("input_" + input_index + "_description_text", color_map.get(5), color_map.get(5));

                } else {
                    SetBackground("input_" + input_index + "_description_text", color_map.get(7), color_map.get(7));

                }
            } else {
                SetBackground("input_" + input_index + "_description_text", color_map.get(8), color_map.get(8));

            }
        }

        if (map.inf2 === "" || map.inf1 === "" || map.inf3 === "") {//Далее по аналогии. Для каждой стадии своё исполнение.
            SetBackground("button_next", color_map.get(5), color_map.get(5));
        } else {
            if (map.inf4 === "") {
                SetBackground("button_next", color_map.get(7), color_map.get(7));
            } else {
                SetBackground("button_next", color_map.get(8), color_map.get(8));
            }
        }

    }
    if (map.mode === 3) {
        if (map.pd === 0) {
            SetBackground("answer_text_big", color_map.get(5), color_map.get(5));
            SetBackground("button_next", color_map.get(5), color_map.get(5));
        } else {
            SetBackground("answer_text_big", color_map.get(8), color_map.get(8));
            SetBackground("button_next", color_map.get(8), color_map.get(8));
        }
    }
    if (map.mode === 4) {
        if (GetElement("input_1").value === '') {
            SetBackground("input_1_description_text", color_map.get(5), color_map.get(5));
        } else {
            SetBackground("input_1_description_text", color_map.get(8), color_map.get(8));
        }
        if (GetElement("input_2").value === '') {
            SetBackground("input_2_description_text", color_map.get(7), color_map.get(7));
        } else {
            SetBackground("input_2_description_text", color_map.get(8), color_map.get(8));
        }

        map.pinf1 = GetElement("input_1").value;
        map.pinf2 = GetElement("input_2").value;
        if (map.pinf1 === "") {
            SetBackground("button_next", color_map.get(5), color_map.get(5));
        } else {
            if (map.pinf2 === "") {
                SetBackground("button_next", color_map.get(7), color_map.get(7));
            } else {
                SetBackground("button_next", color_map.get(8), color_map.get(8));
            }
        }
        if (point_opened) {
            GetElement("info_text_5").innerText = "Название отправной точки: " + map.pinf1 + ".";
            GetElement("info_text_6").innerText = "Примечания: " + map.pinf2 + ".";
        }
    }
    if (map.mode === 5) {
        SetBackground("button_next", color_map.get(8), color_map.get(8));
        if (map.crd !== 0) {
            SetBackground("button_back", color_map.get(5), color_map.get(5));
        }
    }
    if (map.mode === 6) {
        if (GetElement("input_1").value === '') {
            SetBackground("input_1_description_text", color_map.get(5), color_map.get(5));
            SetBackground("button_next", color_map.get(5), color_map.get(5));
        } else {
            SetBackground("input_1_description_text", color_map.get(8), color_map.get(8));
            SetBackground("button_next", color_map.get(8), color_map.get(8));
        }
        map.unam = GetElement("input_1").value;
        GetElement("user").innerText = map.unam;
    }
    if (map.mode === 7) {
        SetBackground("button_back", color_map.get(7), color_map.get(7));
        if (GetElement("input_1").value === '') {
            SetBackground("input_1_description_text", color_map.get(5), color_map.get(5));
            SetBackground("button_next", color_map.get(5), color_map.get(5));
        } else {
            SetBackground("input_1_description_text", color_map.get(8), color_map.get(8));
            SetBackground("button_next", color_map.get(8), color_map.get(8));
        }
        map.rd[map.crd].name = GetElement("input_1").value;
        if (GetElement("road_name_" + map.crd) != null) {
            GetElement("road_name_" + map.crd).innerText = map.rd[map.crd].name;
        }
    }
    if (map.mode === 8) {
        if (GetElement("input_1").value === '' || isNaN(GetElement("input_1").value) || parseInt(GetElement("input_1").value) === 0) {
            SetBackground("input_1_description_text", color_map.get(5), color_map.get(5));
        } else {
            SetBackground("input_1_description_text", color_map.get(8), color_map.get(8));
        }
        if (GetElement("input_2").value === '' || isNaN(GetElement("input_2").value) || parseInt(GetElement("input_2").value) === 0) {
            SetBackground("input_2_description_text", color_map.get(5), color_map.get(5));
        } else {
            SetBackground("input_2_description_text", color_map.get(8), color_map.get(8));
        }
        if ((GetElement("input_1").value === '' || isNaN(GetElement("input_1").value)) || (GetElement("input_2").value === '' || isNaN(GetElement("input_2").value)) || parseInt(GetElement("input_1").value) === 0 || parseInt(GetElement("input_2").value) === 0) {
            SetBackground("answer_text_big", color_map.get(5), color_map.get(5));
            SetBackground("button_next", color_map.get(5), color_map.get(5));
        } else {
            SetBackground("answer_text_big", color_map.get(8), color_map.get(8));
            SetBackground("button_next", color_map.get(8), color_map.get(8));
        }
    }
    if (map.mode === 9 || map.mode === 14) {
        if (map.chs === -1) {
            SetBackground("answer_text_big", color_map.get(5), color_map.get(5));
            SetBackground("button_next", color_map.get(5), color_map.get(5));
        } else {
            SetBackground("answer_text_big", color_map.get(8), color_map.get(8));
            SetBackground("button_next", color_map.get(8), color_map.get(8));
        }
    }
    if (map.mode === 11) {
        map.hs[map.chs].name = GetElement("input_1").value;
        if (house_opened) {
            GetElement("info_text_7").innerText = map.hs[map.chs].name;
        }
        if (GetElement("house_" + map.chs) != null) {
            GetElement("house_" + map.chs).innerText = map.hs[map.chs].name;
        }
        if (GetElement("input_1").value === "") {
            SetBackground("input_1_description_text", color_map.get(5), color_map.get(5));
            SetBackground("button_next", color_map.get(5), color_map.get(5));
        } else {
            SetBackground("input_1_description_text", color_map.get(8), color_map.get(8));
            SetBackground("button_next", color_map.get(8), color_map.get(8));
        }
    }
    if (map.mode === 12) {
        map.hs[map.chs].info[0] = GetElement("input_1").value;
        map.hs[map.chs].info[1] = GetElement("input_2").value;
        map.hs[map.chs].info[2] = GetElement("input_3").value;
        map.hs[map.chs].info[3] = GetElement("input_4").value;
        if (house_opened) {
            for (let i = 0; i < 4; i++) {
                GetElement("info_text_" + (i + 8)).innerText = map.hs[map.chs].info[i];
            }
        }
        if (GetElement("input_1").value === "") {
            SetBackground("input_1_description_text", color_map.get(7), color_map.get(7));
        } else {
            SetBackground("input_1_description_text", color_map.get(8), color_map.get(8));
        }
        if (GetElement("input_2").value === "") {
            SetBackground("input_2_description_text", color_map.get(7), color_map.get(7));
        } else {
            SetBackground("input_2_description_text", color_map.get(8), color_map.get(8));
        }
        if (GetElement("input_3").value === "") {
            SetBackground("input_3_description_text", color_map.get(7), color_map.get(7));
        } else {
            SetBackground("input_3_description_text", color_map.get(8), color_map.get(8));
        }
        if (GetElement("input_4").value === "") {
            SetBackground("input_4_description_text", color_map.get(7), color_map.get(7));
        } else {
            SetBackground("input_4_description_text", color_map.get(8), color_map.get(8));
        }
        if (GetElement("input_4").value === "" || GetElement("input_3").value === "" || GetElement("input_2").value === "" || GetElement("input_1").value === "") {
            SetBackground("answer_text_big", color_map.get(7), color_map.get(7));
            SetBackground("button_next", color_map.get(7), color_map.get(7));
        } else {
            SetBackground("answer_text_big", color_map.get(8), color_map.get(8));
            SetBackground("button_next", color_map.get(8), color_map.get(8));

        }
    }
    if (map.mode === 13) {
        if (map.hs[map.chs].block !== [] && map.hs[map.chs].block !== 0) {
            SetBackground("answer_text_big", color_map.get(8), color_map.get(8));
            SetBackground("answer_text_small", color_map.get(8), color_map.get(8));
            SetBackground("button_next", color_map.get(8), color_map.get(8));
        } else {
            SetBackground("answer_text_big", color_map.get(7), color_map.get(7));
            SetBackground("answer_text_small", color_map.get(7), color_map.get(7));
            SetBackground("button_next", color_map.get(7), color_map.get(7));
        }
    }
    if (map.mode === 16) {
        map.rd[map.crd].object_left = GetElement("input_1").value;
        map.rd[map.crd].object_right = GetElement("input_2").value;
        if (GetElement("road_object_left_" + map.crd) != null) {
            GetElement("road_object_left_" + map.crd).innerText = map.rd[map.crd].object_left;
        }
        if (GetElement("road_object_right_" + map.crd) != null) {
            GetElement("road_object_right_" + map.crd).innerText = map.rd[map.crd].object_right;
        }
        if (GetElement("input_1").value === "") {
            SetBackground("input_1_description_text", color_map.get(7), color_map.get(7));
        } else {
            SetBackground("input_1_description_text", color_map.get(8), color_map.get(8));
        }
        if (GetElement("input_2").value === "") {
            SetBackground("input_2_description_text", color_map.get(7), color_map.get(7));
        } else {
            SetBackground("input_2_description_text", color_map.get(8), color_map.get(8));
        }
        if (GetElement("input_1").value !== "" && GetElement("input_2").value !== "") {
            SetBackground("button_next", color_map.get(8), color_map.get(8));
        } else {
            SetBackground("button_next", color_map.get(7), color_map.get(7));
        }
    }
    if (map.mode === 17) {
        if (map.rd[map.crd + 1] != null || map.rd[map.crd + 2] != null || map.rd[map.crd + 3] != null || map.rd[map.crd + 4] != null) {
            SetBackground("answer_text_big", color_map.get(8), color_map.get(8));
            SetBackground("button_next", color_map.get(8), color_map.get(8));
        } else {
            SetBackground("answer_text_big", color_map.get(5), color_map.get(5));
            SetBackground("button_next", color_map.get(5), color_map.get(5));
        }
    }
    if (map.mode === 18) {
        if (map.rdnd !== 0) {
            SetBackground("answer_text_big", color_map.get(8), color_map.get(8));
        } else {
            SetBackground("answer_text_big", color_map.get(5), color_map.get(5));
        }
    }
    if (map.mode === 20) {
        map.epinf = GetElement("input_1").value;
        if (map.epinf !== "") {
            SetBackground("button_next", color_map.get(8), color_map.get(8));
            SetBackground("input_1_description_text", color_map.get(8), color_map.get(8));
        } else {
            SetBackground("button_next", color_map.get(5), color_map.get(5));
            SetBackground("input_1_description_text", color_map.get(5), color_map.get(5));
        }
    }
    setTimeout(Check, 20);//Зацикливание метода.
}


function OpenHouse(fast = false) {//Открывает информацию о сооружении в зависимости от расположения сооружения относительно дороги.
    if (!house_opened) {
        house_opened = true;
        let bw = 1920 / map.vx;
        let bh = 1080 / map.vy;
        if (map.hs[map.chs].dir === 1) {
            for (let i = 0; i < 4; i++) {
                GetElement("info_text_" + (i + 8)).innerText = map.hs[map.chs].info[i];
                MoveText("info_text_" + (i + 8), (map.hs[map.chs].x - map.cx) * bw, (map.hs[map.chs].y - map.cy) * bh + 50 + i * 25 - 160, fast);
            }
            MoveText("info_text_7", (map.hs[map.chs].x - map.cx) * bw, (map.hs[map.chs].y - map.cy) * bh-150, fast);
        }
        if (map.hs[map.chs].dir === 3) {
            for (let i = 0; i < 4; i++) {
                GetElement("info_text_" + (i + 8)).innerText = map.hs[map.chs].info[i];
                MoveText("info_text_" + (i + 8), (map.hs[map.chs].x - map.cx) * bw, (map.hs[map.chs].y - map.cy) * bh + 50 + i * 25 + 10 * bh, fast);
            }
            MoveText("info_text_7", (map.hs[map.chs].x - map.cx) * bw, (map.hs[map.chs].y - map.cy) * bh + 10 + 10 * bh, fast);
        }
        if (map.hs[map.chs].dir === 2) {
            for (let i = 0; i < 4; i++) {
                GetElement("info_text_" + (i + 8)).innerText = map.hs[map.chs].info[i];
                MoveText("info_text_" + (i + 8), (map.hs[map.chs].x - map.cx) * bw + 10 * bw + 10, (map.hs[map.chs].y - map.cy) * bh + 50 + i * 25, fast);
            }
            MoveText("info_text_7", (map.hs[map.chs].x - map.cx) * bw + 10 * bw + 10, (map.hs[map.chs].y - map.cy) * bh + 10, fast);
        }
        if (map.hs[map.chs].dir === 4) {
            for (let i = 0; i < 4; i++) {
                GetElement("info_text_" + (i + 8)).innerText = map.hs[map.chs].info[i];
                MoveText("info_text_" + (i + 8), (map.hs[map.chs].x - map.cx) * bw - 270, (map.hs[map.chs].y - map.cy) * bh + 50 + i * 25, fast);
            }
            MoveText("info_text_7", (map.hs[map.chs].x - map.cx) * bw - 270, (map.hs[map.chs].y - map.cy) * bh + 10, fast);
        }
        GetElement("info_text_7").innerText = map.hs[map.chs].name;
    } else {
        house_opened = false;
        for (let i = 0; i < 5; i++) {
            MoveText("info_text_" + (i + 7), 1500, -hidden_y * 1.1, fast);
        }
    }
}

function OpenPoint(fast = false) {//Открывает информацию о начальной точке в зависимости от расположения начальной точки относительно дороги.
    if (!point_opened) {
        point_opened = true;
        let bw = 1920 / map.vx;
        let bh = 1080 / map.vy;
        if (map.rd[0] != null && map.rd[0].dir === 1) {
            MoveText("info_text_5", map.px * bw - map.cx * bw, map.py * bh + map.ps * bh + 10 - map.cy * bh, fast);
            MoveText("info_text_6", map.px * bw - map.cx * bw, map.py * bh + map.ps * bh + 50 - map.cy * bh, fast);
        }
        if (map.rd[0] != null && map.rd[0].dir > 1) {
            MoveText("info_text_5", map.px * bw - map.cx * bw, map.py * bh - 80 - map.cy * bh, fast);
            MoveText("info_text_6", map.px * bw - map.cx * bw, map.py * bh - 40 - map.cy * bh, fast);
        }
        GetElement("info_text_5").innerText = "Название отправной точки: " + map.pinf1 + ".";
        GetElement("info_text_6").innerText = "Примечания: " + map.pinf2 + ".";
    } else {
        point_opened = false;
        MoveText("info_text_5", 1150, -hidden_y * 1.1, fast);
        MoveText("info_text_6", 1150, -hidden_y * 1.1, fast);
    }

}

function OpenInfo(fast = false) {//Открывает информацию о маршруте.
    if (!info_opened) {
        info_opened = true;
        for (let text_index = 1; text_index <= 4; text_index++) {
            let info_name = "";
            if (text_index === 1) {
                info_name = "Область/край/регион : " + map.inf1;
            }
            if (text_index === 2) {
                info_name = "Город/населенный пункт : " + map.inf2;
            }
            if (text_index === 3) {
                info_name = "Район : " + map.inf3;
            }
            if (text_index === 4) {
                info_name = "Примечания : " + map.inf4;
            }
            GetElement("info_text_" + text_index).innerText = info_name;
            MoveText("info_text_" + text_index, 670, 20 + 40 * text_index, fast);

        }
    } else {
        info_opened = false;
        for (let text_index = 1; text_index <= 4; text_index++) {
            MoveText("info_text_" + text_index, 670, -hidden_y, fast);
        }
    }
}

function ClearScene() {//Очищает интерфейс.
    for (let button_index = 0; button_index <= 12; button_index++) {
        MoveButton("button_" + button_index, 10, -hidden_y * 1.1);
    }
    MoveGoodInput("input_1", 10, -hidden_y * 1.1);
    MoveGoodInput("input_2", 10, -hidden_y * 1.1);
    MoveGoodInput("input_3", 10, -hidden_y * 1.1);
    MoveGoodInput("input_4", 10, -hidden_y * 1.1);
    EditGoodInput("input_1", 1, 20);
    EditGoodInput("input_2", 1, 20);
    EditGoodInput("input_3", 1, 20);
    EditGoodInput("input_4", 1, 20);
    MoveButton("button_back", 10, -hidden_y * 1.1);
    MoveButton("button_next", 10, -hidden_y * 1.1);
    MoveText("answer_text_big", 10, -hidden_y * 1.1);
    GetElement("answer_text_big").style.backgroundColor = "white";

    MoveText("answer_text_small", 10, -hidden_y * 1.1);
    GetElement("answer_text_small").style.backgroundColor = "white";
    HideHouseCreator("creator");
}

function Next(dir, must) {//Метод, осуществляющий переходы между стадиями заполнения маршрута.
    let next_mode = map.mode + dir;
	if (next_mode === 31) {
		map.mode = 14;
		Next(0);
		return;
	}
	if (next_mode === 30) {
		map.mode = 30;
        ClearScene();
		MoveText("answer_text_big", 10, 10);
        GetElement("answer_text_big").innerText = "Добавление фото сооружения.";
        SetBackground("answer_text_big", color_map.get(7), color_map.get(7));
        GetElement("button_1").innerText = "Добавить";
        GetElement("button_2").innerText = "Пропустить";
        SetBackground("button_1", color_map.get(7), color_map.get(7));
        SetBackground("button_2", color_map.get(7), color_map.get(7));
        EditButton("button_1", 240, 40, 30);
        EditButton("button_2", 240, 40, 30);
        MoveButton("button_1", 10, 90);
        MoveButton("button_2", 300, 90);
	}
	if (next_mode === 29) {
		map.mode = 13;
		Next(0);
		return;
	}
    if (next_mode === 23) {
        map.mode = 23;
        ClearScene();
        SetBackground("button_1", color_map.get(7), color_map.get(7));
        GetElement("button_1").innerText = "Сохранить маршрут";
        EditButton("button_1", 200, 80, 30);
        MoveButton("button_1", 210, 10);
    }
    if (next_mode === 22) {
        map.mode = 22;
        ClearScene();
        MoveText("answer_text_big", 10, 10);
        GetElement("answer_text_big").innerText = "Сооружение уже заполнено. Изменить?";
        SetBackground("answer_text_big", color_map.get(7), color_map.get(7));
        GetElement("button_1").innerText = "Да";
        GetElement("button_2").innerText = "Нет";
        SetBackground("button_1", color_map.get(7), color_map.get(7));
        SetBackground("button_2", color_map.get(7), color_map.get(7));
        EditButton("button_1", 80, 40, 30);
        EditButton("button_2", 80, 40, 30);
        MoveButton("button_1", 10, 90);
        MoveButton("button_2", 450, 90);
    }
    if (next_mode === 21) {
        if (map.epinf !== "") {
            map.mode = 11;
            Next(0);
            return;
        }
    }
    if (next_mode === 20) {
        map.mode = 20;
        ClearScene();
        EditGoodInput("input_1", 20, 20);
        MoveGoodInput("input_1", 10, 60);
        map.epx = map.hs[map.chs].x;
        map.epy = map.hs[map.chs].y;
        GetElement("input_1_description_text").innerText = "Введите название конечной точки:";
        MoveButton("button_back", 10, 130);
        MoveButton("button_next", 450, 130);
    }
    if (next_mode === 19) {
        if (map.mode !== 20) {
            if (map.rdnd !== 0) {
                CreateRoad(map.rd[map.crd + map.rdnd].dir, map.rd[map.crd + map.rdnd].type, map.rd[map.crd + map.rdnd].background_color, map.rd[map.crd + map.rdnd].color, map.rd[map.crd + map.rdnd].name, map.crd + map.rdnd + 4);
                DeleteRoad(map.crd + map.rdnd);
                map.crd += map.rdnd + 4;
                map.mode = 5;
                map.bc = [0, 0, 0, 0];
                UpdateMap();
                Next(0, true);
            }
        } else {
            map.mode = 10;
            Next(0);
            return;
        }
    }
    if (next_mode === 18) {
        if (map.rd[map.crd + 1] != null || map.rd[map.crd + 2] != null || map.rd[map.crd + 3] != null || map.rd[map.crd + 4] != null) {
            map.mode = 18;
            map.rdnd = 0;
            ClearScene();
            for (let button_index = 1; button_index <= 4; button_index++) {
                if (map.rd[map.crd + button_index] != null) {
                    SetBackground("button_" + button_index, color_map.get(7), color_map.get(7));
                } else {
                    SetBackground("button_" + button_index, color_map.get(5), color_map.get(5));
                }
            }
            map.bc = [0, 0, 0, 0];
            MoveText("answer_text_big", 10, 10);
            GetElement("answer_text_big").innerText = "Укажите направление продолжения маршрута:";
            GetElement("button_1").innerText = '🠕';
            GetElement("button_2").innerText = '🠖';
            GetElement("button_3").innerText = '🠗';
            GetElement("button_4").innerText = '🠔';
            EditButton("button_1", 100, 40, 20);
            EditButton("button_2", 100, 40, 20);
            EditButton("button_3", 100, 40, 20);
            EditButton("button_4", 100, 40, 20);
            let undir;
            if (map.rd[map.crd].dir === 1) {
                undir = 3;
            }
            if (map.rd[map.crd].dir === 2) {
                undir = 4;
            }
            if (map.rd[map.crd].dir === 3) {
                undir = 1;
            }
            if (map.rd[map.crd].dir === 4) {
                undir = 2;
            }
            SetBackground("button_" + undir, color_map.get(5), color_map.get(5));
            MoveButton("button_1", 260, 100);
            MoveButton("button_2", 410, 250);
            MoveButton("button_3", 260, 400);
            MoveButton("button_4", 110, 250);
            MoveButton("button_back", 10, 600);
            MoveButton("button_next", 450, 600);
        }
    }
    if (next_mode === 17) {
        map.mode = 17;
        ClearScene();
        for (let button_index = 1; button_index <= 4; button_index++) {
            if (map.bc[button_index - 1] === 0) {
                SetBackground("button_" + button_index, color_map.get(7), color_map.get(7));
            } else {
                SetBackground("button_" + button_index, color_map.get(8), color_map.get(8));
            }
        }
        if (map.chs !== -1) {
            if (house_opened) {
                OpenHouse();
            }
            map.hs[map.chs].color = map.hs[map.chs].last_color;
            if (map.hs[map.chs].block === 0) {
                GetElement("house_" + map.chs).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
            } else {
                for (let point_index = 0; point_index < map.hs[map.chs].block.length; point_index++) {
                    if (GetElement('house_' + map.chs + '_' + point_index) != null) {
                        GetElement('house_' + map.chs + '_' + point_index).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
                    }
                }
            }
        }
        MoveText("answer_text_big", 10, 10);
        GetElement("answer_text_big").innerText = "Укажите вид перекрёстка или поворота:";
        GetElement("button_1").innerText = '🠕';
        GetElement("button_2").innerText = '🠖';
        GetElement("button_3").innerText = '🠗';
        GetElement("button_4").innerText = '🠔';
        EditButton("button_1", 100, 40, 20);
        EditButton("button_2", 100, 40, 20);
        EditButton("button_3", 100, 40, 20);
        EditButton("button_4", 100, 40, 20);
        let undir;
        if (map.rd[map.crd].dir === 1) {
            undir = 3;
        }
        if (map.rd[map.crd].dir === 2) {
            undir = 4;
        }
        if (map.rd[map.crd].dir === 3) {
            undir = 1;
        }
        if (map.rd[map.crd].dir === 4) {
            undir = 2;
        }

        let bw = 1920 / map.vx;
        let bh = 1080 / map.vy;
        map.us = map.rd[map.crd].width;
        GetElement("user").style.width = (bw * map.us) + "px";
        GetElement("user").style.height = (bh * map.us) + "px";
        GetElement("user").style.fontSize = Math.ceil(40 * (96 / map.vx) * map.us / 2) + "px";
        if (map.rd[map.crd].dir === 3) {
            map.ux = map.rd[map.crd].x;
            map.uy = map.rd[map.crd].y + map.rd[map.crd].length;
        }
        if (map.rd[map.crd].dir === 1) {
            map.ux = map.rd[map.crd].x;
            map.uy = map.rd[map.crd].y;
        }
        if (map.rd[map.crd].dir === 2) {
            map.ux = map.rd[map.crd].x + map.rd[map.crd].length;
            map.uy = map.rd[map.crd].y;
        }
        if (map.rd[map.crd].dir === 4) {
            map.ux = map.rd[map.crd].x;
            map.uy = map.rd[map.crd].y;
        }
        map.vx = (96);
        map.vy = (54);
        map.cx = map.ux - map.vx / 2;
        map.cy = map.uy - map.vy / 2;
        ClearMap();
        UpdateMap();
        GetElement("user").style.left = ((map.ux - map.cx) * bw) + "px";
        GetElement("user").style.top = ((map.uy - map.cy) * bh) + "px";
        SetBackground("button_" + undir, color_map.get(5), color_map.get(5));
        MoveButton("button_1", 260, 100);
        MoveButton("button_2", 410, 250);
        MoveButton("button_3", 260, 400);
        MoveButton("button_4", 110, 250);
        MoveButton("button_back", 10, 600);
        MoveButton("button_next", 450, 600);
    }
    if (next_mode === 15) {
        if (dir !== -1) {
            next_mode = 10;
        } else {
            next_mode = 14;
        }
    }
    if (next_mode === 16) {
        map.mode = 16;
        if (dir === -1) {
            ClearMap();
            DeleteRoad(map.crd + 1);
            DeleteRoad(map.crd + 2);
            DeleteRoad(map.crd + 3);
            DeleteRoad(map.crd + 4);
            UpdateMap();
        }
        if (house_opened) {
            OpenHouse();
        }
        if (map.chs !== -1) {
            map.hs[map.chs].color = map.hs[map.chs].last_color;
            if (map.hs[map.chs].block === 0) {
                GetElement("house_" + map.chs).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
            } else {
                for (let point_index = 0; point_index < map.hs[map.chs].block.length; point_index++) {
                    if (GetElement('house_' + map.chs + '_' + point_index) != null) {
                        GetElement('house_' + map.chs + '_' + point_index).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
                    }
                }
            }
        }
        map.chs = -1;
        ClearScene();
        let bw = 1920 / map.vx;
        let bh = 1080 / map.vy;
        map.us = map.rd[map.crd].width;
        GetElement("user").style.width = (bw * map.us) + "px";
        GetElement("user").style.height = (bh * map.us) + "px";
        GetElement("user").style.fontSize = Math.ceil(40 * (96 / map.vx) * map.us / 2) + "px";
        if (map.rd[map.crd].dir === 3) {
            map.ux = map.rd[map.crd].x;
            map.uy = map.rd[map.crd].y + map.rd[map.crd].length;
        }
        if (map.rd[map.crd].dir === 1) {
            map.ux = map.rd[map.crd].x;
            map.uy = map.rd[map.crd].y;
        }
        if (map.rd[map.crd].dir === 2) {
            map.ux = map.rd[map.crd].x + map.rd[map.crd].length;
            map.uy = map.rd[map.crd].y;
        }
        if (map.rd[map.crd].dir === 4) {
            map.ux = map.rd[map.crd].x;
            map.uy = map.rd[map.crd].y;
        }

        GetElement("user").style.left = ((map.ux - map.cx) * bw) + "px";
        GetElement("user").style.top = ((map.uy - map.cy) * bh) + "px";
        EditGoodInput("input_1", 20, 20);
        EditGoodInput("input_2", 20, 20);
        MoveGoodInput("input_1", 10, 60);
        MoveGoodInput("input_2", 10, 170);
        GetElement("input_1_description_text").innerText = "Введите название ориентира слева:";
        GetElement("input_2_description_text").innerText = "Введите название ориентира справа:";
        MoveButton("button_next", 450, 250);
        MoveButton("button_back", 10, 250);
    }
    if (next_mode === 14) {
		if(map.mode === 13){
			map.mode=30;
			Next(0);
			return;
		}
        if (!HousesFilled() || dir === -1) {
            map.mode = 14;
            if (map.chs !== -1) {
                if (house_opened) {
                    OpenHouse();
                }
                map.hs[map.chs].color = map.hs[map.chs].last_color;
                if (map.hs[map.chs].block === 0) {
                    GetElement("house_" + map.chs).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
                } else {
                    for (let point_index = 0; point_index < map.hs[map.chs].block.length; point_index++) {
                        if (GetElement('house_' + map.chs + '_' + point_index) != null) {
                            GetElement('house_' + map.chs + '_' + point_index).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
                        }
                    }
                }
            }
            map.chs = -1;
            let bw = 1920 / map.vx;
            let bh = 1080 / map.vy;
            map.us = map.rd[map.crd].width;
            GetElement("user").style.width = (bw * map.us) + "px";
            GetElement("user").style.height = (bh * map.us) + "px";
            GetElement("user").style.fontSize = Math.ceil(40 * (96 / map.vx) * map.us / 2) + "px";
            if (map.rd[map.crd].dir === 3) {
                map.ux = map.rd[map.crd].x;
                map.uy = map.rd[map.crd].y + map.rd[map.crd].length;
            }
            if (map.rd[map.crd].dir === 1) {
                map.ux = map.rd[map.crd].x;
                map.uy = map.rd[map.crd].y;
            }
            if (map.rd[map.crd].dir === 2) {
                map.ux = map.rd[map.crd].x + map.rd[map.crd].length;
                map.uy = map.rd[map.crd].y;
            }
            if (map.rd[map.crd].dir === 4) {
                map.ux = map.rd[map.crd].x;
                map.uy = map.rd[map.crd].y;
            }
            GetElement("user").style.left = ((map.ux - map.cx) * bw) + "px";
            GetElement("user").style.top = ((map.uy - map.cy) * bh) + "px";
            ClearScene();
            MoveText("answer_text_big", 10, 10);
            GetElement("answer_text_big").innerText = 'Нажмите на любое сооружение:';
            MoveButton("button_next", 450, 90);
            MoveButton("button_back", 10, 90);
        } else {
            if (map.epinf === "") {
                map.mode = 16;
                Next(0, true);
            } else {
                if (map.chs !== -1) {
                    if (house_opened) {
                        OpenHouse();
                    }
                    map.hs[map.chs].color = map.hs[map.chs].last_color;
                    if (map.hs[map.chs].block === 0) {
                        GetElement("house_" + map.chs).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
                    } else {
                        for (let point_index = 0; point_index < map.hs[map.chs].block.length; point_index++) {
                            if (GetElement('house_' + map.chs + '_' + point_index) != null) {
                                GetElement('house_' + map.chs + '_' + point_index).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
                            }
                        }
                    }
                }
                map.mode = 23;
                Next(0, true);
            }

        }
    }
    if (next_mode === 13) {
        if (map.mode !== 14) {
            map.mode = 13;
            ClearScene();
            ClearMap();
            map.hs[map.chs].block = 0;
            map.hs[map.chs].points = 0;
            UpdateMap();
            ShowHouseCreator("creator", 10, 110, 400, 400);
            MoveText("answer_text_big", 10, 10);
            GetElement("answer_text_big").innerText = 'Выберете форму здания.';
            MoveText("answer_text_small", 10, 50);
            GetElement("answer_text_small").innerText = 'Расставьте углы здания:';
            SetBackground("answer_text_big", color_map.get(7), color_map.get(7));
            SetBackground("answer_text_small", color_map.get(7), color_map.get(7));
            for (let button_index = 4; button_index <= 12; button_index++) {
                MoveButton("button_" + button_index, 450, 220 + (button_index - 4) * 35);
                EditButton("button_" + button_index, 30, 30, 10);
                GetElement("button_" + button_index).innerText = "";
            }
            SetBackground("button_4", "#202020", "#3A3A3A");
            SetBackground("button_5", "#BA0016", "#FF5569");
            SetBackground("button_6", "#CB8205", "#FDCE81");
            SetBackground("button_7", "#C3B505", "#FBF076");
            SetBackground("button_8", "#5C9A18", "#A5E65F");
            SetBackground("button_9", "#1FC29D", "#A7F1E0");
            SetBackground("button_10", "#1E67BD", "#9FC4F0");
            SetBackground("button_11", "#6A01C6", "#BA6DFE");
            SetBackground("button_12", "#BABABA", "#FFFFFF");
            MoveButton("button_back", 10, 590);
            MoveButton("button_next", 450, 590);
        } else {
            ClearMap();
            map.hs = [];
            map.hsq = 0;
            map.us = map.rd[map.crd].width;
            if (map.rd[map.crd].dir === 3) {
                EditRoad(map.px, map.py + 2, 20);
                map.ux = map.rd[map.crd].x;
                map.uy = map.rd[map.crd].y + map.rd[map.crd].length;
            }
            if (map.rd[map.crd].dir === 1) {
                EditRoad(map.px, map.py - 20, 20);
                map.ux = map.rd[map.crd].x;
                map.uy = map.rd[map.crd].y;
            }
            if (map.rd[map.crd].dir === 2) {
                EditRoad(map.px + 2, map.py, 20);
                map.ux = map.rd[map.crd].x + map.rd[map.crd].length;
                map.uy = map.rd[map.crd].y;
            }
            if (map.rd[map.crd].dir === 4) {
                EditRoad(map.px - 20, map.py, 20);
                map.ux = map.rd[map.crd].x;
                map.uy = map.rd[map.crd].y;
            }
            if (house_opened) {
                OpenHouse();
            }
            UpdateMap();
            map.mode = 8;
            Next(0, true);
            return;
        }
    }
    if (next_mode === 12) {
        if (map.hs[map.chs].name !== "" || must || dir === -1) {
            if (dir === -1) {
                ClearMap();
                map.hs[map.chs].block = 0;
                map.hs[map.chs].points = 0;
                UpdateMap();
            }
            map.mode = 12;
            ClearScene();
            EditGoodInput("input_1", 20, 20);
            EditGoodInput("input_2", 20, 20);
            EditGoodInput("input_3", 20, 20);
            EditGoodInput("input_4", 20, 20);
            GetElement("input_1").value = map.hs[map.chs].info[0];
            GetElement("input_2").value = map.hs[map.chs].info[1];
            GetElement("input_3").value = map.hs[map.chs].info[2];
            GetElement("input_4").value = map.hs[map.chs].info[3];
            MoveText("answer_text_big", 10, 10);
            SetBackground("answer_text_big", color_map.get(8), color_map.get(8));
            GetElement("answer_text_big").innerText = 'Подробная информация о сооружении:';
            MoveGoodInput("input_1", 10, 140);
            GetElement("input_1_description_text").innerText = "1:";
            GetElement("input_1").innerText = '';
            MoveGoodInput("input_2", 10, 250);
            GetElement("input_2_description_text").innerText = "2:";
            GetElement("input_2").innerText = '';
            MoveGoodInput("input_3", 10, 360);
            GetElement("input_3_description_text").innerText = "3:";
            GetElement("input_3").innerText = '';
            MoveGoodInput("input_4", 10, 470);
            GetElement("input_4_description_text").innerText = "4:";
            GetElement("input_4").innerText = '';
            MoveButton("button_back", 10, 580);
            MoveButton("button_next", 450, 580);
        }
    }
    if (next_mode === 11) {
        map.mode = 11;
        ClearScene();
        EditGoodInput("input_1", 20, 20);
        MoveGoodInput("input_1", 10, 60);
        GetElement("input_1_description_text").innerText = "Введите, как сооружение будет подписано:";
        GetElement("input_1").innerText = map.hs[map.chs].name;
        MoveButton("button_back", 10, 130);
        MoveButton("button_next", 450, 130);
    }
    if (next_mode === 10) {
        if (map.chs !== -1 || must || dir === -1) {
            if (map.epinf !== "") {
                map.mode = 11;
                Next(0);
                return;
            }
            if (map.hs[map.chs].block === 0 || map.hs[map.chs].block === [] || must) {
                if (dir === -1) {
                    map.hs[map.chs].name = "№" + map.hs[map.chs].number;
                    GetElement("house_" + map.chs).innerText = map.hs[map.chs].name;
                }
                map.mode = 10;
                ClearScene();
                MoveText("answer_text_big", 10, 10);
                GetElement("answer_text_big").innerText = 'Является ли данное сооружение конечной точкой?';
                SetBackground("answer_text_big", color_map.get(7), color_map.get(7));
                SetBackground("button_1", color_map.get(7), color_map.get(7));
                SetBackground("button_2", color_map.get(7), color_map.get(7));
                GetElement("button_1").innerText = "Да";
                GetElement("button_2").innerText = "Нет";
                EditButton("button_1", 80, 40, 30);
                EditButton("button_2", 80, 40, 30);
                MoveButton("button_1", 10, 90);
                MoveButton("button_2", 450, 90);
                MoveButton("button_back", 10, 160);
            } else {
                map.mode = 22;
                Next(0);
                return;
            }
        }
    }
    if (next_mode === 9) {
        if (map.mode !== 10) {
            if ((!(GetElement("input_1").value === '' || isNaN(GetElement("input_1").value)) && !(GetElement("input_2").value === '' || isNaN(GetElement("input_2").value))) && parseInt(GetElement("input_1").value) !== 0 && parseInt(GetElement("input_2").value) !== 0) {
                map.mode = 9;
                ClearScene();
                if (map.rd[map.crd].dir === 3) {
                    map.ux = map.rd[map.crd].x;
                    map.uy = map.rd[map.crd].y + map.rd[map.crd].length;
                }
                if (map.rd[map.crd].dir === 1) {
                    map.ux = map.rd[map.crd].x;
                    map.uy = map.rd[map.crd].y;
                }
                if (map.rd[map.crd].dir === 2) {
                    map.ux = map.rd[map.crd].x + map.rd[map.crd].length;
                    map.uy = map.rd[map.crd].y;
                }
                if (map.rd[map.crd].dir === 4) {
                    map.ux = map.rd[map.crd].x;
                    map.uy = map.rd[map.crd].y;
                }
                let houses_left = Math.abs(parseInt(GetElement("input_1").value));
                let houses_right = Math.abs(parseInt(GetElement("input_2").value));
                ClearMap();
                let distance = Math.max((Math.ceil(Math.max(houses_left, houses_right) / 2) * 20), 20);
                if (map.rd[map.crd].dir === 1) {
                    let state = 0;
                    let houses_set = 0;
                    while (houses_set !== houses_left) {
                        CreateHouse(map.ux - 10, map.uy - state + 6, 0, color_map.get(9), "№" + (houses_set + 1), houses_set + 1, 4);
                        houses_set++;
                        state += Math.floor(distance / houses_left);
                    }
                    state = 0;
                    houses_set = 0;
                    while (houses_set !== houses_right) {
                        CreateHouse(map.ux + map.rd[map.crd].width, map.uy - state + 6, 0, color_map.get(9), "№" + (houses_set + 1), houses_set + 1, 2);
                        houses_set++;
                        state += Math.floor(distance / houses_right);
                    }
                    EditRoad(map.ux, map.uy - distance + map.rd[map.crd].width, distance + 20);
                    map.uy -= distance;
                }
                if (map.rd[map.crd].dir === 2) {
                    let state = 0;
                    let houses_set = 0;
                    while (houses_set !== houses_left) {
                        CreateHouse(map.ux + state - 16, map.uy - 10, 0, color_map.get(9), "№" + (houses_set + 1), houses_set + 1, 1);
                        houses_set++;
                        state += Math.floor(distance / houses_left);
                    }
                    state = 0;
                    houses_set = 0;
                    while (houses_set !== houses_right) {
                        CreateHouse(map.ux + state - 16, map.uy + map.rd[map.crd].width, 0, color_map.get(9), "№" + (houses_set + 1), houses_set + 1, 3);
                        houses_set++;
                        state += Math.floor(distance / houses_right);
                    }
                    EditRoad(map.ux - 20, map.uy, distance + 20);
                    map.ux += distance;
                }
                if (map.rd[map.crd].dir === 3) {
                    let state = 0;
                    let houses_set = 0;
                    while (houses_set !== houses_left) {
                        CreateHouse(map.ux + map.rd[map.crd].width, map.uy + state - 16, 0, color_map.get(9), "№" + (houses_set + 1), houses_set + 1, 2);
                        houses_set++;
                        state += Math.floor(distance / houses_left);
                    }
                    state = 0;
                    houses_set = 0;
                    while (houses_set !== houses_right) {
                        CreateHouse(map.ux - 10, map.uy + state - 16, 0, color_map.get(9), "№" + (houses_set + 1), houses_set + 1, 4);
                        houses_set++;
                        state += Math.floor(distance / houses_right);
                    }
                    EditRoad(map.ux, map.uy - 20, distance + 20);
                    map.uy += distance;
                }
                if (map.rd[map.crd].dir === 4) {
                    let state = 0;
                    let houses_set = 0;
                    while (houses_set !== houses_left) {
                        CreateHouse(map.ux - state + 6, map.uy + map.rd[map.crd].width, 0, color_map.get(9), "№" + (houses_set + 1), houses_set + 1, 3);
                        houses_set++;
                        state += Math.floor(distance / houses_left);
                    }
                    state = 0;
                    houses_set = 0;
                    while (houses_set !== houses_right) {
                        CreateHouse(map.ux - state + 6, map.uy - 10, 0, color_map.get(9), "№" + (houses_set + 1), houses_set + 1, 1);
                        houses_set++;
                        state += Math.floor(distance / houses_right);
                    }
                    EditRoad(map.ux - distance + map.rd[map.crd].width, map.uy, distance + 20);
                    map.ux -= distance;
                }
                if (map.rd[map.crd].dir === 1) {
                    map.vx = (distance + 30) * 1.77;
                    map.vy = (distance + 30);
                    map.cx = map.rd[map.crd].x - map.vx / 1.5;
                    map.cy = map.rd[map.crd].y;
                }
                if (map.rd[map.crd].dir === 2) {
                    map.vx = (distance + 30) * 1.52;
                    map.vy = (distance + 30) * 1.52 * 0.56;
                    map.cx = map.rd[map.crd].x - map.vx / 3.04 - 4;
                    map.cy = map.rd[map.crd].y - map.vy / 2;
                }
                if (map.rd[map.crd].dir === 3) {
                    map.vx = (distance + 30) * 1.77;
                    map.vy = (distance + 30);
                    map.cx = map.rd[map.crd].x - map.vx / 1.5;
                    map.cy = map.rd[map.crd].y - 4;
                }
                if (map.rd[map.crd].dir === 4) {
                    map.vx = (distance + 30) * 1.52;
                    map.vy = (distance + 30) * 1.52 * 0.56;
                    map.cx = map.rd[map.crd].x - map.vx / 3.04;
                    map.cy = map.rd[map.crd].y - map.vy / 2;
                }
                UpdateMap();
                map.mode = 14;
                Next(0, true);
                return;
            }
        } else {
            map.mode = 14;
            Next(0, true);
            return;
        }
    }
    if (next_mode === 8) {
        if (map.rd[map.crd].name !== '' || must) {
            map.mode = 8;
            map.chs = -1;
            map.epinf = "";
            ClearScene();
            MoveText("answer_text_big", 10, 10);
            GetElement("answer_text_big").innerText = 'Укажите количество сооружений.';
            GetElement("input_1_description_text").innerText = 'Слева от дороги:';
            GetElement("input_1").value = '';
            EditGoodInput("input_1", 4, 4);
            MoveGoodInput("input_1", 10, 130);
            GetElement("input_2_description_text").innerText = 'Справа от дороги:';
            GetElement("input_2").value = '';
            EditGoodInput("input_2", 4, 4);
            MoveGoodInput("input_2", 10, 250);
            MoveButton("button_back", 10, 390);
            MoveButton("button_next", 450, 390);
        }
    }
    if (next_mode === 7) {
        if (map.unam !== '' || must) {
            map.mode = 7;
            ClearScene();
            EditGoodInput("input_1", 20, 20);
            MoveGoodInput("input_1", 10, 60);
            GetElement("input_1_description_text").innerText = 'Введите название улицы/дороги от точки "А"';
            GetElement("input_1").value = map.rd[map.crd].name;
            MoveButton("button_back", 10, 150);
            MoveButton("button_next", 450, 150);
        }
    }
    if (next_mode === 6) {
        if (map.mode !== 7) {
            if (map.crd === 0) {
                map.mode = 6;
                ClearScene();
                EditGoodInput("input_1", 1, 1);
                MoveGoodInput("input_1", 10, 60);
                GetElement("input_1_description_text").innerText = 'Укажите знак метки, отображающий вас на карте:';
                GetElement("input_1").value = map.unam;
                MoveText("answer_text_small", 10, 130);
                GetElement("answer_text_small").innerText = 'Укажите цвет метки:';
                SetBackground("answer_text_small", color_map.get(8), color_map.get(8));
                for (let button_index = 4; button_index <= 12; button_index++) {
                    MoveButton("button_" + button_index, 10 + (button_index - 4) * 35, 185);
                    EditButton("button_" + button_index, 30, 30, 10);
                    GetElement("button_" + button_index).innerText = "";
                }
                SetBackground("button_4", color_map.get(4), "#3A3A3A");
                SetBackground("button_5", color_map.get(5), "#FF5569");
                SetBackground("button_6", color_map.get(6), "#FDCE81");
                SetBackground("button_7", color_map.get(7), "#FBF076");
                SetBackground("button_8", color_map.get(8), "#A5E65F");
                SetBackground("button_9", color_map.get(9), "#A7F1E0");
                SetBackground("button_10", color_map.get(10), "#9FC4F0");
                SetBackground("button_11", color_map.get(11), "#BA6DFE");
                SetBackground("button_12", color_map.get(12), "#FFFFFF");
                MoveButton("button_back", 10, 250);
                MoveButton("button_next", 450, 250);
            } else {
                map.mode = 7;
                Next(0);
                return;
            }
        } else {
            map.mode = 5;
            Next(0);
            return;
        }
    }
    if (next_mode === 5) {
        if (map.pinf1 !== '' || must) {
            map.mode = 5;
            ClearScene();
            Change(map.rd[map.crd].type);
            MoveText("answer_text_big", 10, 10);
            GetElement("answer_text_big").innerText = 'Укажите тип дороги от точки "А" ';
            SetBackground("answer_text_big", color_map.get(8), color_map.get(8));
            MoveText("answer_text_small", 10, 200);
            GetElement("answer_text_small").innerText = 'Укажите цвет дороги:';
            SetBackground("answer_text_small", color_map.get(8), color_map.get(8));
            GetElement("button_1").innerText = 'Второстепенная дорога';
            GetElement("button_2").innerText = 'Проезжая дорога';
            GetElement("button_3").innerText = 'Пешеходная дорога';
            MoveButton("button_1", 10, 80);
            EditButton("button_1", 300, 30, 20);
            MoveButton("button_2", 10, 120);
            EditButton("button_2", 300, 30, 20);
            MoveButton("button_3", 10, 160);
            EditButton("button_3", 300, 30, 20);
            for (let button_index = 4; button_index <= 12; button_index++) {
                MoveButton("button_" + button_index, 10 + (button_index - 4) * 35, 260);
                EditButton("button_" + button_index, 30, 30, 10);
                GetElement("button_" + button_index).innerText = "";
            }
            SetBackground("button_4", color_map.get(4), "#3A3A3A");
            SetBackground("button_5", color_map.get(5), "#FF5569");
            SetBackground("button_6", color_map.get(6), "#FDCE81");
            SetBackground("button_7", color_map.get(7), "#FBF076");
            SetBackground("button_8", color_map.get(8), "#A5E65F");
            SetBackground("button_9", color_map.get(9), "#A7F1E0");
            SetBackground("button_10", color_map.get(10), "#9FC4F0");
            SetBackground("button_11", color_map.get(11), "#BA6DFE");
            SetBackground("button_12", color_map.get(12), "#FFFFFF");
            MoveButton("button_back", 10, 320);
            MoveButton("button_next", 450, 320);
        }
    }
    if (next_mode === 4) {
        if (map.crd === 0) {
            if (map.pd !== 0 || must) {
                map.mode = 4;
                ClearScene();
                MoveText("answer_text_big", 10, 10);
                GetElement("answer_text_big").innerText = 'Ввод данных отправной точки "А".';
                SetBackground("answer_text_big", color_map.get(7), color_map.get(7));
                EditGoodInput("input_1", 20, 20);
                GetElement("input_1").value = map.pinf1;
                GetElement("input_1_description_text").innerText = "Введите наименование фирмы:";
                MoveGoodInput("input_1", 10, 120);
                EditGoodInput("input_2", 20, 20);
                GetElement("input_2").value = map.pinf2;
                GetElement("input_2_description_text").innerText = "Примечание:";
                MoveGoodInput("input_2", 10, 240);
                MoveButton("button_back", 10, 340);
                MoveButton("button_next", 450, 340);
            }
        }
    }
    if (next_mode === 3) {
        if (((map.inf1 !== '' && map.inf2 !== '' && map.inf3 !== '') || dir === -1) || must) {
            map.mode = 3;
            ClearScene();
            if (map.pd !== 0) {
                Change(map.pd);
            }
            map.cx = map.ux - map.vx / 2;
            map.cy = map.uy - map.vy / 2;
            UpdateMap();
            GetElement("answer_text_big").innerText = 'Укажите отправную точку "А" на карте:';
            MoveText("answer_text_big", 10, 10);
            GetElement("button_1").innerText = 'Сверху';
            GetElement("button_2").innerText = 'Справа';
            GetElement("button_3").innerText = 'Снизу';
            GetElement("button_4").innerText = 'Слева';
            EditButton("button_1", 100, 40, 20);
            EditButton("button_2", 100, 40, 20);
            EditButton("button_3", 100, 40, 20);
            EditButton("button_4", 100, 40, 20);
            MoveButton("button_1", 260, 100);
            MoveButton("button_2", 410, 250);
            MoveButton("button_3", 260, 400);
            MoveButton("button_4", 110, 250);
            MoveButton("button_back", 10, 520);
            MoveButton("button_next", 450, 520);
        }
    }
    if (next_mode === 2) {
        if (map.name !== "" || dir === -1 || must) {
            map.mode = 2;
            ClearScene();
            EditGoodInput("input_1", 20, 20);
            EditGoodInput("input_2", 20, 20);
            EditGoodInput("input_3", 20, 20);
            EditGoodInput("input_4", 20, 20);

            GetElement("input_1").value = map.inf1;
            GetElement("input_2").value = map.inf2;
            GetElement("input_3").value = map.inf3;
            GetElement("input_4").value = map.inf4;
            GetElement("input_1_description_text").innerText = "Введите название области/края/региона:";
            MoveGoodInput("input_1", 10, 60);
            MoveGoodInput("input_2", 10, 180);
            MoveGoodInput("input_3", 10, 300);
            MoveGoodInput("input_4", 10, 420);
            MoveButton("button_back", 10, 520);
            MoveButton("button_next", 450, 520);
        }
    }
    if (next_mode === 1) {
        map.mode = 1;
        ClearScene();
        EditGoodInput("input_1", 20, 20);
        GetElement("input_1").value = map.name;
        GetElement("input_1_description_text").innerText = "Введите название маршрута:";
        MoveGoodInput("input_1", 10, 60);
        MoveButton("button_next", 450, 125);
    }
}

function Change(number) {//Функция, которая запускается при нажатии на кнопки.
 if (map.mode === 30) {
        if(number===2){
			Next(1);
		}
    }
    if (map.mode === 23) {
        Safe('safe');
    }
    if (map.mode === 22) {
        if (number === 1) {
            map.mode = 10;
            Next(0, true);
            return;
        }
        if (number === 2) {
            map.mode = 14;
            Next(0);
            return;
        }
    }
    if (map.mode === 18) {
        ClearMap();
        for (let button_index = 1; button_index <= 4; button_index++) {
            if (map.rd[map.crd + button_index] != null) {
                SetBackground("button_" + button_index, color_map.get(7), color_map.get(7));
                map.rd[map.crd + button_index].name = "";
            } else {
                SetBackground("button_" + button_index, color_map.get(5), color_map.get(5));
            }
        }
        if (map.rd[map.crd + number] != null) {
            map.bc = [0, 0, 0, 0];
            map.rd[map.crd + number].name = "ДОРОГА";
            SetBackground("button_" + number, color_map.get(8), color_map.get(8));
            map.bc[number - 1] = 1;
            map.rdnd = number;
        } else {
            map.rdnd = 0;
        }
        UpdateMap();
    }
    if (map.mode === 17) {
        let undir;
        if (map.rd[map.crd].dir === 1) {
            undir = 3;
        }
        if (map.rd[map.crd].dir === 2) {
            undir = 4;
        }
        if (map.rd[map.crd].dir === 3) {
            undir = 1;
        }
        if (map.rd[map.crd].dir === 4) {
            undir = 2;
        }
        if (number !== undir) {
            if (map.bc[number - 1] === 0) {
                map.bc[number - 1] = 1;
                CreateRoad(number, 1, "gray", "black", "", map.crd + number);
                SetBackground("button_" + number, color_map.get(8), color_map.get(8));
            } else {
                map.bc[number - 1] = 0;
                DeleteRoad(map.crd + number);
                SetBackground("button_" + number, color_map.get(7), color_map.get(7));
            }
            ClearMap();
            UpdateMap();
        }
    }
    if (map.mode === 13) {
        map.hs[map.chs].color = color_map.get(number);
        map.hs[map.chs].last_color = color_map.get(number);
        ClearMap();
        UpdateMap();
    }
    if (map.mode === 10) {
        if (number === 1) {
            map.epx = map.ux;
            map.epy = map.uy;
            map.mode = 20;
            Next(0);
        }
        if (number === 2) {
            Next(1);
        }
    }
    if (map.mode === 6) {
        map.ucol = color_map.get(number);
        GetElement('user').style.color = map.ucol;
    }
    if (map.mode === 5) {
        let road_type = map.rd[map.crd].type;
        let road_color = map.rd[map.crd].background_color;
        let road_text_color = map.rd[map.crd].color;
        let dir = map.rd[map.crd].dir;
        ClearMap();
        if (number <= 3) {
            SetBackground("button_1", color_map.get(7), color_map.get(7));
            SetBackground("button_2", color_map.get(7), color_map.get(7));
            SetBackground("button_3", color_map.get(7), color_map.get(7));
            SetBackground("button_" + number, color_map.get(8), color_map.get(8));
            DeleteRoad(map.crd);
            CreateRoad(dir, number, road_color, road_text_color, "ДОРОГА", map.crd);
        } else {
            road_color = color_map.get(number);
            DeleteRoad(map.crd);
            CreateRoad(dir, road_type, road_color, road_text_color, "ДОРОГА", map.crd);
        }
        if (map.crd === 0) {
            if (dir === 1) {
                map.px = map.ux;
                map.py = map.uy + map.rd[map.crd].width;
            }
            if (dir === 2) {
                map.px = map.ux - map.rd[map.crd].width;
                map.py = map.uy;
            }
            if (dir === 3) {
                map.px = map.ux;
                map.py = map.uy - map.rd[map.crd].width;
            }
            if (dir === 4) {
                map.px = map.ux + map.rd[map.crd].width;
                map.py = map.uy;
            }
            map.ps = map.rd[map.crd].width;
        }
        map.us = map.rd[map.crd].width;
        UpdateMap();
    }
    if (map.mode === 3) {
        SetBackground("button_1", color_map.get(7), color_map.get(7));
        SetBackground("button_2", color_map.get(7), color_map.get(7));
        SetBackground("button_3", color_map.get(7), color_map.get(7));
        SetBackground("button_4", color_map.get(7), color_map.get(7));
        SetBackground("button_" + number, color_map.get(8), color_map.get(8));
        ClearMap();
        map.pd = number;
        let dir = 0;


        DeleteRoad(map.rdq - 1);
        if (number === 1) {
            dir = 3;
        }
        if (number === 2) {
            dir = 4;
        }
        if (number === 3) {
            dir = 1;
        }
        if (number === 4) {
            dir = 2;
        }
        CreateRoad(dir, 1, "gray", "black");
        if (number === 1) {
            map.px = map.ux;
            map.py = map.uy - map.rd[map.crd].width;
        }
        if (number === 2) {
            map.px = map.ux + map.rd[map.crd].width;
            map.py = map.uy;
        }
        if (number === 3) {
            map.px = map.ux;
            map.py = map.uy + map.rd[map.crd].width;
        }
        if (number === 4) {
            map.px = map.ux - map.rd[map.crd].width;
            map.py = map.uy;
        }
        UpdateMap();
    }
}


function SelectHouse(index) {//Выбор здания.
    if (map.mode === 14 || map.mode === 16 || map.mode === 23) {
        if (index !== map.chs) {//Если нажатый дом не выбран.
            if (map.chs !== -1) {//Если дом уже выбран, снимаем выделение с предыдущего.
                if (house_opened) {
                    OpenHouse();
                }
                map.hs[map.chs].color = map.hs[map.chs].last_color;
                if (map.hs[map.chs].block === 0) {
                    GetElement("house_" + map.chs).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
                } else {
                    for (let point_index = 0; point_index < map.hs[map.chs].block.length; point_index++) {
                        if (GetElement('house_' + map.chs + '_' + point_index) != null) {
                            GetElement('house_' + map.chs + '_' + point_index).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
                        }
                    }
                }
            }
            map.chs = index;//Выбираем нажатый дом.
            OpenHouse();
            map.hs[map.chs].color = color_map.get(8);
            if (map.hs[map.chs].block !== 0) {//Если дом заполнен.
                for (let point_index = 0; point_index < map.hs[map.chs].block.length; point_index++) {
                    if (GetElement('house_' + map.chs + '_' + point_index) != null) {
                        ButtonDown('house_' + map.chs + '_' + point_index);
                        GetElement('house_' + map.chs + '_' + point_index).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + "," + map.hs[map.chs].color + ")";
                    }
                }
            } else {//Если дом не заполнен.
                ButtonDown("house_" + index);
                GetElement("house_" + index).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + "," + map.hs[map.chs].color + ")";
            }
            let bw = 1920 / map.vx;
            let bh = 1080 / map.vy;
            map.us = map.rd[map.crd].width;
            if (map.rd[map.crd].dir === 1 || map.rd[map.crd].dir === 3) {
                map.ux = map.rd[map.crd].x;
                map.uy = map.hs[map.chs].y;
            }
            if (map.rd[map.crd].dir === 2 || map.rd[map.crd].dir === 4) {
                map.ux = map.hs[map.chs].x;
                map.uy = map.rd[map.crd].y;
            }
            GetElement("user").style.width = (bw * map.us) + "px";
            GetElement("user").style.height = (bh * map.us) + "px";
            MoveText("user", ((map.ux - map.cx) * bw), ( (map.uy - map.cy) * bh));
            GetElement("user").style.fontSize = Math.ceil(40 * (96 / map.vx) * map.us / 2) + "px";
        } else {//Если дом выбран.
            if (house_opened) {
                OpenHouse();
            }
            map.hs[map.chs].color = map.hs[map.chs].last_color;
            if (map.hs[index].block === 0) {
                GetElement("house_" + map.chs).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
                ButtonDown("house_" + index);
            } else {
                for (let point_index = 0; point_index < map.hs[map.chs].block.length; point_index++) {
                    if (GetElement('house_' + map.chs + '_' + point_index) != null) {
                        GetElement('house_' + map.chs + '_' + point_index).style.background = "linear-gradient(0deg, " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ", " + map.hs[map.chs].color + ")";
                        ButtonDown('house_' + map.chs + '_' + point_index);
                    }
                }
            }
            map.chs = -1;
        }
    }
}