alert("Tato hra nemá nic společného s tetrisem.");
/*Canvas samotný*/
const canvas =  document.getElementById('tetris');
const context = canvas.getContext('2d');

/*Zvětšení*/
context.scale(20, 20);

/*Funkce, která zkontroluje, zda je řádek zaplněný, nebo ne. Jestli najde prázné místo, pokračuje na další řádek, dokud nenajde plný.*/
function arenaSweep() {
    let rowCount = 1;
    outer: for(let y = arena.length - 1; y > 0; --y){
        for(let x = 0; x < arena[y].length; ++x){
            if(arena[y][x] === 0){
                continue outer;
            }
        }
        /*Vymaže řádek, který našel zaplněný, vyprázdni ho a přičte skore za samzaný řádek*/
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

/*Funkce, která vytváří "stěny" na krajích canvasu*/
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y){
        for(let x = 0; x < m[y].length; ++x){
            if(m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
        }
    }
    return false;
}
/*Funkce, která vytváří hrací plochu.*/
function createMatrix(w, h){
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
/*Funkce, která vytváří kousky.*/
function createPiece(type){
    if(type === 'T'){
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    }
    else if(type === 'O'){
        return [
            [2, 2],
            [2, 2],
        ]
    }
    else if(type === 'L'){
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ]
    }
    else if(type === 'J'){
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ]
    }
    else if(type === 'I'){
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ]
    }
    else if(type === 'S'){
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ]
    }
    else if(type === 'Z'){
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ]
    }
}
/*Funkce, která umožňuje vykreslovat na canvas*/
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}
/*Funkce pro zobrazení kousku na canvasu*/
function drawMatrix(matrix, offset){
    matrix.forEach((row, y) =>{
        row.forEach((value, x) =>{
            if(value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}
/*Funkce, která spojuje kousky (aby se nemohly prolínat).*/
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value!== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
        }
    });
});

}
/*Funkce, která umožňuje při pádu zastavit kousek, buď o další kousek, nebo o spodek canvasu */
function playerDrop(){
    player.pos.y++;
    if(collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}
/*Funkce pro pohyb a kolize */
function playerMove(dir){
    player.pos.x += dir;
    if(collide(arena, player)){
        player.pos.x -= dir;
    }
}
/*Funkce, která náhodně vybírá kousky + vyresetuje, když se na canvasu kousek dotkne vrchu */
function playerReset(){
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if(collide(arena, player)){
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}
/*Funkce, která umožní hráči otáčet kouskem tak, aby se nemohl zaseknout na kraji canvasu(kousek zpátky vyskočí do canvasu)*/
function playerRotate(dir){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
/*Funkce, která dokáže otáčet kousky*/
function rotate(matrix, dir){
    for(let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x){
            [ matrix [x][y], matrix [y][x],] = [matrix[y][x], matrix[x][y],];
        }
    }
    if(dir > 0){
        matrix.forEach(row => row.reverse());
    }
    else {
        matrix.reverse();
    }
}
/*funkce, která updatuje canvas a umožňuje pohybovat kousky (co sekundu se pohne sám dolů)*/
let dropCounter = 0;
let dropInterval = 1000;
let LastTime = 0;
function update(time = 0) {
    const deltaTime = time - LastTime;
    LastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}
/*Funkce, která updatuje skore*/
function updateScore(){
    document.getElementById('score').innerHTML = player.score;
}

/*barvy kousků*/
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',

];
/*funkce pro canvas, která určuje maximální počet kousků v poli (kostiček)*/
const arena = createMatrix(12, 20);
/*funkce, kde začíná padat kousek*/
const player = {
    pos: {x:0, y:0},
    matrix: null,
    score: 0,
}
/*Funkce pro ovladání kousků (jednoduše ovládání)*/
document.addEventListener('keydown', event =>{
    if (event.keyCode === 37 || event.keyCode === 65){
        playerMove(-1);
    }
    else if(event.keyCode === 39 || event.keyCode === 68) {
        playerMove(1);
    }
    else if(event.keyCode === 40 || event.keyCode === 83) {
        playerDrop();
    }
    else if(event.keyCode === 81){
        playerRotate(-1);
    }
    else if(event.keyCode === 69){
        playerRotate(1);
    }
})
/*Tlačítko, které spustí hru, a zmizí.*/
let button = document.getElementById('tlacitko');
button.addEventListener("click", function(){
    tlacitko.style.visibility = "hidden";
    playerReset();
    updateScore();
    update();
})


