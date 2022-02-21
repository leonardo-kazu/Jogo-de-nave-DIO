var game = {};
var canShoot = true;
var randomYAxis = parseInt(Math.random() * 334);
var endgame = false;
var music = document.getElementById("music");
var soundFire = document.getElementById("soundFire");
var soundGameover = document.getElementById("soundGameover");
var soundExplosion = document.getElementById("soundExplosion");
var soundLost = document.getElementById("soundLost");
var soundSaved = document.getElementById("soundSaved");


var energy;
var score;
var saved;
var lost;

const KEY = {
    W: 87,
    S: 83,
    D: 68,
    UP_ARROW: 38,
    DOWN_ARROW: 40, 
    SPACE: 32,
};

$("#inicio").click(function (e) { 
    e.preventDefault();
    start();
    
});
music.addEventListener("ended", function(){ music.currentTime = 0; music.play(); }, false);

function start() {
    music.play();
    $("#inicio").hide();
    energy = 3;
    score = 0;
    saved = 0;
    lost = 0;
    endgame = false;
    $("#fundo").append("<div id='scoreboard'></div>");
    $("#fundo").append("<div id='player' class='animaPlayer'></div>");
    $("#fundo").append("<div id='enemyChopper' class='animaEnemy'></div>");
    $("#fundo").append("<div id='enemyTruck'></div>");
    $("#fundo").append("<div id='friendly' class='animaFriendly'></div>");
    $("#fundo").append("<div id='energy'></div>");
    let speed = 5;
    
    game.pressed = [];
    
    $(document).keydown(function (e) { 
        game.pressed[e.which] = true;
    });

    $(document).keyup(function (e) { 
        delete game.pressed[e.which];
    });
    
    game.timer = setInterval(loop, 30);
    
    function loop() {
        
        moveFundo();
        movePlayer(game, canShoot);
        moveEnemyChopper(speed);
        moveEnemyTruck();
        moveFriendly();
        impact();
        scoreboard();
        energyStat();
    }

}

function moveFundo() {
    let esquerda = parseInt($("#fundo").css("background-position"));
    $("#fundo").css("background-position", --esquerda);
}

function movePlayer(game) {
    let yAxis = parseInt($("#player").css("top"));
    if (game.pressed[KEY.W] || game.pressed[KEY.UP_ARROW]) {

        $("#player").css("top", yAxis - 10);
        if (yAxis <= 0) {

            $("#player").css("top", yAxis + 10);

        }
    }
    if (game.pressed[KEY.S] || game.pressed[KEY.DOWN_ARROW]) {

        $("#player").css("top", yAxis + 10);
        if (yAxis >= 434) {

            $("#player").css("top", yAxis - 10);

        }
    }
    if (game.pressed[KEY.D] || game.pressed[KEY.SPACE]) {

        shoot();

    } 
}

function moveEnemyChopper(speed) {
    let xAxis = parseInt($("#enemyChopper").css("left"));
    $("#enemyChopper").css("left", xAxis - speed);
    $("#enemyChopper").css("top", randomYAxis);
    
    if (xAxis <= 0) {

        randomYAxis = parseInt(Math.random() * 334);
        $("#enemyChopper").css("top", randomYAxis);
        $("#enemyChopper").css("left", 694);

    }
}

function moveEnemyTruck() {
    let xAxis = parseInt($("#enemyTruck").css("left"));
    $("#enemyTruck").css("left", xAxis - 3);

    if (xAxis <= 0) {

        $("#enemyTruck").css("left", 775);

    }
}

function moveFriendly() {
    let xAxis = parseInt($("#friendly").css("left"));
    $("#friendly").css("left", ++xAxis);

    if (xAxis >= 906) {

        $("#friendly").css("left", 0);

    }
}

function shoot() {
// Deve ter uma maneira melhor de lidar com esses ifs porém não consegui pensar em outra sem criar variáveis globais.
    if (canShoot === true) {

        canShoot = false;

    } else {

        return;

    }
    let yAxis = parseInt($("#player").css("top"));
    let xAxis = parseInt($("#player").css("left"));
    $("#fundo").append("<div id='projectile'></div>");
    $("#projectile").css("top", yAxis + 37);
    $("#projectile").css("left", xAxis + 190);
    soundFire.play();
    let timeProjectile = setInterval(fire, 30);
    
    function fire() {
        let xAxis = parseInt($("#projectile").css("left"));
        $("#projectile").css("left", xAxis + 15);

        if (xAxis >= 900 || xAxis <= 0) {
            clearInterval(timeProjectile);
            timeProjectile = null;
            $("#projectile").remove();
            canShoot = true;

        }
    }
}

function impact() {
    let impactOne = $("#player").collision($("#enemyChopper"));
    if (impactOne.length > 0) {

        let xAxis = parseInt($("#enemyChopper").css("left"));
        let yAxis = parseInt($("#enemyChopper").css("top"));
        explosionOne(xAxis, yAxis);
        randomYAxis = parseInt(Math.random() * 334);
        $("#enemyChopper").css("left", 694);
        $("#enemyChopper").css("top", randomYAxis);
        energy--;

    }

    let impactTwo = $("#player").collision($("#enemyTruck"));
    if (impactTwo.length > 0) {

        let xAxis = parseInt($("#enemyTruck").css("left"));
        let yAxis = parseInt($("#enemyTruck").css("top"));
        explosionTwo(xAxis, yAxis);
        $("#enemyTruck").remove();
        respawnEnemyTruck(xAxis, yAxis);
        energy--;

    }

    let impactThree = $("#projectile").collision($("#enemyChopper"));
    if (impactThree.length > 0) {

        let xAxis = parseInt($("#enemyChopper").css("left"));
        let yAxis = parseInt($("#enemyChopper").css("top"));
        $("#projectile").css("left", 900);
        explosionOne(xAxis, yAxis);
        randomYAxis = parseInt(Math.random() * 334);
        $("#enemyChopper").css("left", 694);
        $("#enemyChopper").css("top", randomYAxis);
        score += 100;

    }

    let impactFour = $("#projectile").collision($("#enemyTruck"));
    if (impactFour.length > 0) {
        
        let xAxis = parseInt($("#enemyTruck").css("left"));
        let yAxis = parseInt($("#enemyTruck").css("top"));
        $("#projectile").css("left", 900);
        explosionTwo(xAxis, yAxis);
        $("#enemyTruck").remove();
        respawnEnemyTruck(xAxis, yAxis);
        score += 50;

    }

    let impactFive = $("#player").collision($("#friendly"));
    if (impactFive.length > 0) {
        $("#friendly").remove();
        soundSaved.play();
        respawnFriendly();
        saved++;
    }

    let impactSix = $("#enemyTruck").collision($("#friendly"));
    if (impactSix.length > 0) { 
        soundLost.play();
        friendlyDeath();
        respawnFriendly();
        lost++;
    }
}

function explosionOne(xAxis, yAxis) {
    $("#fundo").append("<div id='explosionOne'></div>");
    $("#explosionOne").css("left", xAxis);
    $("#explosionOne").css("top", yAxis);
    soundExplosion.play();
    let explosionOneTime = setInterval(removeExplosion, 1000);

    function removeExplosion() {
        $("#explosionOne").remove();
        clearInterval(explosionOneTime);
        explosionOneTime = null;
    }
}

function explosionTwo(xAxis, yAxis) {
    $("#fundo").append("<div id='explosionTwo'></div>");
    $("#explosionTwo").css("left", xAxis);
    $("#explosionTwo").css("top", yAxis);
    soundExplosion.play();
    let explosionTwoTime = setInterval(removeExplosion, 1000);

    function removeExplosion() {
        $("#explosionTwo").remove();
        clearInterval(explosionTwoTime);
        explosionTwoTime = null;
    }
}

function respawnEnemyTruck() {
    let collisionTime = setInterval(respawn, 5000);

    function respawn() {
        clearInterval(collisionTime);
        collisionTime = null;

        if (endgame === false) {
            
            $("#fundo").append("<div id='enemyTruck'></div>");

        }
    }
}

function respawnFriendly() {

    let collisionTime = setInterval(respawn, 6000);

    function respawn() {
        clearInterval(collisionTime);
        collisionTime = null;

        if (endgame === false) {

            $("#fundo").append("<div id='friendly' class='animaFriendly'></div>");

        }
    }
}

function friendlyDeath() {
    let xAxis = parseInt($("#friendly").css("left"));
    let yAxis = parseInt($("#friendly").css("top"));

    $("#friendly").remove();
    $("#fundo").append("<div id='friendlyDeath'></div>");
    $("#friendlyDeath").css("left", xAxis);
    $("#friendlyDeath").css("top", yAxis);
    explosionTwo(xAxis + 40, yAxis + 10);
    $("#enemyTruck").remove();
    respawnEnemyTruck(xAxis, yAxis);


    let deathTime = setInterval(removeDeath, 1000);

    function removeDeath(){
        $("#friendlyDeath").remove();
        clearInterval(deathTime);
        deathTime = null;
    }

}

function scoreboard() {
    $("#scoreboard").html(`<h3> Pontos: ${score} Salvos: ${saved} Lost: ${lost}</h3>`);
}

function energyStat() {
    switch (energy) {
        case 2:
            $("#energy").css("background-image", "url(/assets/imgs/energia2.png)");
            break;
            
        case 1:
            $("#energy").css("background-image", "url(/assets/imgs/energia1.png)");    
            break;
                
        case 0:
            $("#energy").css("background-image", "url(/assets/imgs/energia0.png)");        
            finish();
            break;
    }
}

function finish() {
    endgame = true;
    music.pause();
    soundGameover.play();
    clearInterval(game.timer);
    game.timer = null;

    $("#player").remove();
    $("#enemyTruck").remove();
    $("#enemyChopper").remove();
    $("#friendly").remove();
    $("#scoreboard").remove();

    $("#fundo").append("<div id='fim'></div>");
    
    $("#fim").html(`<h1> Game Over </h1><p> Sua pontuação foi: ${score} + ${saved} aliados salvos.<h4>Jogar Novamente<h4>`);

    $("#fim").click(function (e) { 
        e.preventDefault();
        soundGameover.pause();
        $("#fim").remove();
        start();
    });
}