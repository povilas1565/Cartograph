

function AddInput(id) {//Добавление ячейки поля для ввода.
    if (parseInt(GetElement(id).maxLength) < input_max_length.get(id)) {
        GetElement(id).maxLength = parseInt(GetElement(id).maxLength) + 1;
    }
}

function DelInput(id) {//Удаление ячейки поля для ввода.
    if (parseInt(GetElement(id).maxLength) > 1) {
        GetElement(id).maxLength = parseInt(GetElement(id).maxLength) - 1;
    }
}

function SetBackground(id, color_1, color_2 = "white", deg = 0) {//Устанавливаем задний фон элементов.
    GetElement(id).style.background = "linear-gradient(" + deg + "deg, " + color_1 + ", " + color_2 + ")";
}

function GetElement(id) {//Сокращенное получение id элемента.
    return document.getElementById(id);
}


function ShowHouseCreator(id, x, y, width, height) {//Метод, показывающий поле для создания иконок.
    for (let ix = 0; ix < 10; ix++) {
        for (let iy = 0; iy < 10; iy++) {
            document.body.innerHTML += "<div class='element' id='" + id + "_" + ix + "_" + iy + "' onmousedown='SetBlock(" + ix + "," + iy + ")' style='left:" + (x + ix * (width / 10 + 2)) + "px;top:" + (y + iy * (height / 10 + 4)) + "px;width:" + (width / 10) + "px;height:" + (width / 10) + "px; z-index:3;text-align:center;background: linear-gradient(0deg, white, white);border: 1px hidden gray;border-radius: 1px'></div>";
        }
    }
    //Создаем кнопку "очистить".
    CreateButton(id + "_delete", x + width + 25, y, 150, 50, "Очистить", "ClearCreator()");
    GetElement(id + "_delete", color_map.get(7), color_map.get(7));

}

function HideHouseCreator(id) {//Метод, скрывающий поле для создания иконок.
    for (let ix = 0; ix < 10; ix++) {
        for (let iy = 0; iy < 10; iy++) {
            if (GetElement(id + "_" + ix + "_" + iy) != null) {
                GetElement(id + "_" + ix + "_" + iy).remove();
            }
        }
    }
    //Удаляем кнопку "очистить".
    if (GetElement(id + "_delete") != null) {
        GetElement(id + "_delete").remove();
    }

}

function ClearCreator() {//Метод, очищающий поле для создания иконок.
    for (let ix = 0; ix < 10; ix++) {
        for (let iy = 0; iy < 10; iy++) {
            SetBackground("creator_" + ix + "_" + iy, "white", "white");
        }
    }
    ClearMap();
    //Приравниваем переменные block и points нулю.
    map.hs[map.chs].points = 0;
    map.hs[map.chs].block = 0;
    UpdateMap();
}


function SetBlock(x, y) {//Установка блока на поле для создания иконок.
    if (map.hs[map.chs].block === 0) {//Если иконка не заполнена, заполняем её.
        map.hs[map.chs].block = [];
        for (let ix = 0; ix < 100; ix++) {
            map.hs[map.chs].block[ix] = {x: -1, y: -1};
        }
    }
    if (map.hs[map.chs].block[x + y * 10].x !== x ||
        map.hs[map.chs].block[x + y * 10].y !== y) {//Если мы ещё не заполнили данный отсек, заполняем его и обновляем карту.
        map.hs[map.chs].block[x + y * 10].x = x;
        map.hs[map.chs].block[x + y * 10].y = y;
        map.hs[map.chs].points += 1;
        SetBackground("creator_" + x + "_" + y, color_map.get(8), color_map.get(8));
        ClearMap();
        UpdateMap();
    } else {//Если мы уже заполнили данный отсек, очищаем его и обновляем карту (удаление заполненной яйчейки в иконке).
        map.hs[map.chs].block[x + y * 10].x = -1;
        map.hs[map.chs].block[x + y * 10].y = -1;
        SetBackground("creator_" + x + "_" + y, "white", "white");
        ClearMap();
        UpdateMap();
    }
}

function EditObject(id, x, y, w, h, size) { //Редактирование объекта согласно параметрам.
    GetElement(id).style.left = x + "px";
    GetElement(id).style.top = y + "px";
    GetElement(id).style.width = w + "px";
    GetElement(id).style.height = h + "px";
    GetElement(id).style.fontSize = size + "px";
}

function CreateMap() { //Создание зданего фонаэ
    document.body.innerHTML += "<div class='element' id='map' style='z-index:1;left:0;top:0;width:1920px;height:1080px;background: linear-gradient(45deg,#FCC973,#FBC05C)'></div>";
}

function CreateRectangle(index, x1l, y1l, x2l, y2l, color) {//Создание простого прямоугольника на карте
    let bw = 1920 / map.vx;
    let bh = 1080 / map.vy;
    let x1, x2, y1, y2;
    if (x1l > x2l) {
        x1 = x2l;
        x2 = x1l;
    } else {
        x1 = x1l;
        x2 = x2l;
    }
    if (y1l > y2l) {
        y1 = y2l;
        y2 = y1l;
    } else {
        y1 = y1l;
        y2 = y2l;
    }

    if (GetElement(index) == null) {//Если его не существует, создаём.
        document.body.innerHTML += "<div class='element' id='" + index + "' style='left:" + (x1 * bw) + "px;top:" + (y1 * bh) + "px;width:" + ((x2 - x1 + 1) * bw) + "px;height:" + ((y2 - y1 + 1) * bh) + "px; z-index:1;background-color: " + color + "'></div>";
    } else {//Если он существует, меняем.
        GetElement(index).style.left = (x1 * bw) + "px";
        GetElement(index).style.top = (y1 * bh) + "px";
        GetElement(index).style.width = ((x2 - x1 + 1) * bw) + "px";
        GetElement(index).style.height = ((y2 - y1 + 1) * bh) + "px";
    }
}

function CreateText(id, x, y, size, value, color_1 = "white", color_2 = "white") {//Метод, создающий текст в соответсвтии с параметрами.
    document.body.innerHTML += "<h1 class='element' id='" + id + "' style='left:" + (x) + "px;top:" + (y) + "px;font-size:" + size + "px;z-index:4; background: linear-gradient(0deg, " + color_1 + ", " + color_2 + ");border: 1px hidden gray;border-radius: 5px;padding: 7px;' onmousedown=\"ButtonDown('" + id + "');\">" + value + "</h1>";
}

function MoveText(id, x, y, fast) {//Метод, перемещающий текст в соответсвтии с параметрами.
    Move(id, x, y, fast);

}

function CreateButton(id, x, y, width, height, value, click, size, color_1 = "white", color_2 = "white") {//Метод, создающий кнопку в соответсвтии с параметрами.
    document.body.innerHTML += "<button class='element' id='" + id + "' style='left:" + (x) + "px;top:" + (y) + "px;width:" + (width) + "px;height:" + (height) + "px;z-index:4;outline-style: hidden; outline-width: 1px; font-size:" + size + "px; background: linear-gradient(0deg, " + color_1 + ", " + color_2 + ");border: 1px hidden gray;border-radius: 30px' onclick=\"" + click + "\" onmousedown=\"ButtonDown('" + id + "');\">" + value + "</button>";
}

function MoveButton(id, x, y, fast) {//Метод, перемещающий кнопку в соответсвтии с параметрами.
    Move(id, x, y, fast);
}

function EditButton(id, width, height, size) {//Метод, который редактирует кнопку в соответсвтии с параметрами.
    GetElement(id).style.width = (width) + "px";
    GetElement(id).style.height = (height) + "px";
    GetElement(id).style.fontSize = size + "px";
}


function CreateGoodInput(id, x, y, width, height, length, max_length, description) {//Метод, создающий поле для ввода в соответсвтии с параметрами.
    CreateText(id + "_description_text", x, y - 50, 20, description);
    document.body.innerHTML += "<input class='element' id='" + id + "' style='font-size:30px;left:" + (x) + "px;top:" + (y + 10) + "px;width:" + (width * length) + "px;height:" + (height) + "px;z-index:4;background: linear-gradient(0deg, white, white);border: 1px hidden gray;border-radius: 9px;letter-spacing: 11px' maxlength='" + length + "' onmousedown=\"ClickedInput('" + id + "');\">";

    input_max_length.set(id, max_length);
}

function MoveGoodInput(id, x, y, fast) {//Перемещение поля для ввода в соответствии с параметрами.
    GetElement(id).style.left = x + "px";
    GetElement(id).style.top = y + 10 + "px";
    MoveText(id + "_description_text", x, y - 50, fast);
}

function EditGoodInput(id, length, max_length) {//Редактирование поля для ввода в соответствии с параметрами.
    input_max_length.set(id, max_length);
    while (parseInt(GetElement(id).maxLength) > length) {
        DelInput(id);
    }
    while (parseInt(GetElement(id).maxLength) < length) {
        AddInput(id);
    }
}

function SafeInputValues() {//Сохранение значений полей для ввода.
    let value = [];
    for (let input_index = 1; input_index <= 4; input_index++) {
        let id = "input_" + input_index;
        value[input_index - 1] = GetElement(id).value;
    }
    return value;
}

function SetInputValues(value) {//Выгрузка значений полей для ввода.
    for (let input_index = 1; input_index <= 4; input_index++) {
        let id = "input_" + input_index;
        GetElement(id).value = value[input_index - 1];
    }
}


function ClickedInput(id) {//При нажатии на поле для ввода, регистрирует его, как последний нажатый объект и как последнее нажатое поле для ввода.
    if (input_clicked !== "") {//Если нажато другое поле для ввода, снимает с него выделение нажатого.
        UnclickInput();
    }
    input_clicked = id;
    last_clicked = id;
    SetBackground(id, "#DDDDDD", "#F6F6F6");
}

function UnclickInput() {//Снимает с поля для ввода выделение нажатого.
    SetBackground(input_clicked, "white", "white");
    input_clicked = "";
}

/**
 * @return {boolean}
 */
function Near(value_field, value) { //Проверяет, близко ли находится объект
    return (value_field + 5 >= value && value_field - 5 <= value);
}
/**
 * @return {boolean}
 */
function CanMove(id, q) {//Проверяет, может ли объект двигаться (быть анимированным).
    return objects_moved.get(id) === q;
}

function MoveDrag(id, xneed, yneed, fast, delay, q) {//Метод, отвечающий за перемещение объектов (анимация).
    if (fast) {//Если переменная fast равна true, меняем координаты моментально.
        GetElement(id).style.left = (xneed) + "px";
        GetElement(id).style.top = (yneed) + "px";
        return;
    }
    if (CanMove(id, q) && GetElement(id) !== null) {
        let x, y;
        x = parseInt(GetElement(id).style.left.replace("px", ""));//Считываем знаения координат X и Y объекта.
        y = parseInt(GetElement(id).style.top.replace("px", ""));
        if (x < xneed && !Near(xneed, x)) {//Перемещаем объект.
            x += Math.ceil((xneed - x) / 2);
        }
        if (x > xneed && !Near(xneed, x)) {
            x -= Math.ceil((x - xneed) / 2);
        }
        if (y < yneed && !Near(yneed, y)) {
            y += Math.ceil((yneed - y) / 2);
        }
        if (y > yneed && !Near(yneed, y)) {
            y -= Math.ceil((y - yneed) / 2);
        }
        if (Near(xneed, x) && Near(yneed, y)) {//Если объект близко к той точке, к которой двигался, функция завершается.
            GetElement(id).style.left = (xneed) + "px";
            GetElement(id).style.top = (yneed) + "px";
            objects_moving--;
        } else {//Если объект не близко к той точке, к которой двигается, функция зацикливается.
            GetElement(id).style.left = (x) + "px";
            GetElement(id).style.top = (y) + "px";
            setTimeout(function () {
                MoveDrag(id, xneed, yneed, fast, delay, q);
            }, delay);
        }
    }
}

function Move(id, x, y, fast) {//Упрощенный вызов метода MoveDrag.
    objects_moving++;
    if (!objects_moved.has(id)) {
        objects_moved.set(id, 0);
    } else {
        objects_moved.set(id, objects_moved.get(id) + 1);
    }
    MoveDrag(id, x, y, fast, 10, objects_moved.get(id));
}

function CreateHouse(x, y, block, color, name = "ДОМ", number = 0, dir = 0) {//Создание объекта сооружения.
    map.hs[map.hsq] = {//Устанавливаем параметры сооружения.
        block: block,
        x: x,
        y: y,
        color: color,
        last_color: color,
        name: name,
        points: 0,
        info: ['', '', '', ''], //Информация о сооружении.
        number: number, //Номер сооружения
        rd: map.crd, //К какой дороге прилегает сооружение.
        dir: dir //С какой стороны находится сооружение от дороги.
    };
    map.hsq++;
}

function CreateRoad(dir, type, background, color, name = "ДОРОГА", id = -1) {//Создаём объект дороги в массиве согласно параметрам и присваеваем ему id.
    if (id === -1) {
        map.crd = map.rdq;//Если параметр id не подлежал никаким изменениям, кладём в него значение, равное количеству объектов дорог.
        id = map.crd;
    }
    let x = map.ux;//Сохраняем позицию пользователя на карте.
    let y = map.uy;
    if (dir === 1) {//Изменяем позицию согласно положению дороги.
        y -= 20;
    }
    if (dir === 4) {
        x -= 20;
    }
    map.rd[id] = { //Устанавливаем параметры дороги.
        dir: dir,
        x: x,
        y: y,
        name: name,
        type: type,
        color: color,
        width: 2,
        length: 20,
        background_color: "gray",
        object_left: "",
        object_right: ""
    };
    if (type === 1) {//Изменение некоторых параметров в зависимости от типа дороги.
        map.rd[id].width = 3;
    }
    if (type === 2) {
        map.rd[id].width = 4;
    }
    if (type === 3) {
        map.rd[id].background_color = "blue";
        map.rd[id].width = 2;
    }
    map.rd[id].background_color = background;
    map.rdq++;
}


function EditRoad(x, y, length, id = -1) { //Редактируем параметры дороги.
    if (id === -1) {
        id = map.crd;
    }
    map.rd[id].x = x;
    map.rd[id].y = y;
    map.rd[id].length = length;
}

function DeleteRoad(id) { //Удаляем объект дороги
    if (map.rd[id] != null) {
        map.rd[id] = null;
        map.rdq--;
    }
}

/**
 * @return {boolean}
 */
function HousesFilled() {//Проверяет, заполнены ли дома.
    for (let house_index = 0; house_index < map.hsq; house_index++) {
        if (map.hs[house_index].points <= 0) {
            return false;
        }
    }
    return true;
}


/**
 * @return {boolean}
 */
function IsView(x, y, w, h) {//Метод, проверяющий, соприкасаются ли объекты.
    let x2 = map.cx;
    let y2 = map.cy;
    let w2 = map.vx;
    let h2 = map.vy;
    return (((x >= x2 && x <= x2 + w2) || (x <= x2 && x + w >= x2)) && ((y >= y2 && y <= y2 + h2) || (y <= y2 && y + h >= y2))); //Проверка.
}


function ButtonDown(id) { //Анимация при нажатии с указанием id элемента.
    setTimeout(function () {
        GetElement(id).style.width = Math.abs(parseInt(GetElement(id).style.width.replace("px", "")) - 4) + "px";
        GetElement(id).style.height = Math.abs(parseInt(GetElement(id).style.height.replace("px", "")) - 4) + "px";
        GetElement(id).style.left = parseInt(GetElement(id).style.left.replace("px", "")) + 2 + "px";
        GetElement(id).style.top = parseInt(GetElement(id).style.top.replace("px", "")) + 2 + "px";
    }, 10);
    setTimeout(function () {
        GetElement(id).style.width = Math.abs(parseInt(GetElement(id).style.width.replace("px", "")) - 2) + "px";
        GetElement(id).style.height = Math.abs(parseInt(GetElement(id).style.height.replace("px", "")) - 2) + "px";
        GetElement(id).style.left = parseInt(GetElement(id).style.left.replace("px", "")) + 1 + "px";
        GetElement(id).style.top = parseInt(GetElement(id).style.top.replace("px", "")) + 1 + "px";
    }, 20);
    setTimeout(function () {
        GetElement(id).style.width = Math.abs(parseInt(GetElement(id).style.width.replace("px", "")) + 2) + "px";
        GetElement(id).style.height = Math.abs(parseInt(GetElement(id).style.height.replace("px", "")) + 2) + "px";
        GetElement(id).style.left = parseInt(GetElement(id).style.left.replace("px", "")) - 1 + "px";
        GetElement(id).style.top = parseInt(GetElement(id).style.top.replace("px", "")) - 1 + "px";
    }, 30);
    setTimeout(function () {
        GetElement(id).style.width = Math.abs(parseInt(GetElement(id).style.width.replace("px", "")) + 4) + "px";
        GetElement(id).style.height = Math.abs(parseInt(GetElement(id).style.height.replace("px", "")) + 4) + "px";
        GetElement(id).style.left = parseInt(GetElement(id).style.left.replace("px", "")) - 2 + "px";
        GetElement(id).style.top = parseInt(GetElement(id).style.top.replace("px", "")) - 2 + "px";
    }, 40);
    setTimeout(function (w, h, x, y) {
        GetElement(id).style.width = Math.abs(w) + "px";
        GetElement(id).style.height = Math.abs(h) + "px";
        GetElement(id).style.left = x + "px";
        GetElement(id).style.top = y + "px";
    }, 50, parseInt(GetElement(id).style.width.replace("px", "")), parseInt(GetElement(id).style.height.replace("px", "")), parseInt(GetElement(id).style.left.replace("px", "")), parseInt(GetElement(id).style.top.replace("px", "")));
    GetElement(id).style.width = Math.abs(parseInt(GetElement(id).style.width.replace("px", "")) - 4) + "px";
    GetElement(id).style.height = Math.abs(parseInt(GetElement(id).style.height.replace("px", "")) - 4) + "px";
    GetElement(id).style.left = parseInt(GetElement(id).style.left.replace("px", "")) + 2 + "px";
    GetElement(id).style.top = parseInt(GetElement(id).style.top.replace("px", "")) + 2 + "px";
}

function View(value) { //Изменение области обзора пропорционально по оси X и Y.
    if (map.vx > 100 || value > 0) {
        map.cx -= Math.round(map.vx / value) / 2;
        map.cy -= Math.round(map.vx / value) / 2;
        map.vx += Math.round(map.vx / value);
        map.vy += Math.round(map.vy / value);
    }
    UpdateMap();
}

function ShortMoveView(value, id = 0) { //Функция, позволяющая быстро приблизить или отдалить поле обзора.
    id++;
    View(value);
    if (id < 10) {
        setTimeout(ShortMoveView, 10, value, id);
    }
}

function Camera(value_x, value_y) { //Изменение положения поля обзора.
    map.cx += value_x;
    map.cy += value_y;
    UpdateMap();
}

function ShortMoveCamera(value_x, value_y, id = 0) {//Функция, позволяющая быстро изменить положение поля обзора.
    id++;

    map.cx += Math.ceil(value_x / 10);
    map.cy += Math.ceil(value_y / 10);
    Camera(0, 0);
    if (id < 10) {
        setTimeout(ShortMoveCamera, 10, value_x, value_y, id);
    }

}


function Safe(name) { //Сохранение объекта map в хранилище localStorage в формате JSON.
    localStorage.clear();
    localStorage.setItem(name + "_map", JSON.stringify(map));
}

function Load(name) { //выгрузка объекта map из хранилища localStorage.
    map = JSON.parse(localStorage.getItem(name + "_map"));
    GetElement("main_text").innerText = map.name;
    ClearMap();
    UpdateMap();
    Next(0, true);
}
