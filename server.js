const PORT = 8080;
var homepage = '/home.html';

var express = require('express');
var os = require('os');
var networkInterfaces = os.networkInterfaces();

var app = require('express')();
var http = require('http').createServer(app);
var path = require('path');

var publicPath = path.resolve(__dirname); 
app.use(express.static(publicPath));
app.get('/', (req, res) => {
  res.sendFile(__dirname + homepage);
});

http.listen(PORT, () => {
	console.log("server.js active");
	if (networkInterfaces['Ethernet 2']){
		IP_private_ETH = networkInterfaces['Ethernet 2'][2].address	
		console.log("IP_private_ETH : "+ IP_private_ETH);
	}
	
	IP_private_WiFi = networkInterfaces['Wi-Fi'][1].address			// Home Wifi 
	console.log("IP_private_WiFi : "+ IP_private_WiFi);
	console.log("PORT : "+ PORT);
    console.log('The server is working on http://localhost:' + PORT);
    
    
});



const bodyParser = require("body-parser");
const router = require("express").Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var allGames = [];
var Game = {};
var index_game = 0;

function move(original, computerteam){

    var myarr = original.split('');

    var index = Math.floor(Math.random() * 9);

    while(myarr[index] != '-'){
        index = Math.floor(Math.random() * 9);
    }
    myarr[index] = computerteam;
    var newmove = myarr.toString();
    newmove = newmove.replace(/,/g,'');
    console.log("computer movement: " + newmove);

    return newmove; 
}


router.post('/api/v1/games',(request,response) => {
   // Start a new game

    /*
        In my game 'x' moves first. I consider that 
        if the board comes empty ('---------') then 
        the user chose the team 'o' and if it comes 
        with some 'x' then he chose the team 'x' (example '--x------').
    */

    var computerteam;
    
    console.log(request.body);
    var board = request.body.board;
    if( board == '---------' ){     // user chose the team 'o'
        computerteam = 'x';     
        board = move(board, computerteam);

        Game = {
            id: index_game, 
            board: board,
            status: 'RUNNING',
            computerteam: computerteam,
            userteam: 'o'
        }
        index_game++;

        allGames.push( Game ); 

        
        response.setHeader('Location', '/api/v1/games/' +  Game.id );
        
        var yourgame = {
            location: '/api/v1/games/' +  Game.id 
        }

        response.status(201).send( yourgame );

    }else { // user chose the team 'x' or some error
    
        var myarr = board.split('');
        var empty = 0, x = 0;

        if(myarr.length!=9) { // error 400 Bad request
            var errorob = {
                reason: 'Board lenght is not 9'
            }
            console.log('board.length: ' + myarr.length);
            console.log('error 400 Bad request: Board lenght is not 9');
            response.status(400).send( errorob ); 
            return;
        }

        // at the end must be just one 'x' and the rest '-'
        for(i=0; i < myarr.length; i++){
            if( myarr[i] == '-'){
                empty++;
            }else if( myarr[i] == 'x'){
                x++;
            }
        }

        if ( empty==8 && x==1 ){
            // everything is ok (Y)
            computerteam = 'o';
            board = move(board, computerteam);

            Game = {
                id: index_game, 
                board: board,
                status: 'RUNNING',
                computerteam: computerteam,
                userteam: 'x'
            }
            index_game++;

            allGames.push( Game ); 

            
            response.setHeader('Location', '/api/v1/games/' +  Game.id );
            
            var yourgame = {
                location: '/api/v1/games/' +  Game.id 
            }

            response.status(201).send( yourgame );
        } else {
            // error 400 Bad request
            var errorob = {
                reason: 'invalid movement'
            }
            response.status(400).send( errorob );
        }

    }
}); // End of router.post to '/api/v1/games'

router.get('/api/v1/games/:uuid' ,(req,res) => { // Get a game

    var id = req.params.uuid;
    var yourgame;

    for(var i=0; i< allGames.length; i++){
        if( allGames[i].id == id){
            yourgame = {
                id: allGames[i].id, 
                board: allGames[i].board,
                status: allGames[i].status
            }

            res.send( yourgame ); // Successful response, returns the game
            break;
        }
    }
    
    res.status(404).end();  

});

router.put('/api/v1/games/:uuid' ,(req,res) => { // Post a new move to a game

    var id = req.params.uuid;
    var yourmove = req.body.board;
    var winnerTeam;
    var i;

    for(i=0; i< allGames.length; i++){
        if( allGames[i].id == id){
            // validating
            if( allGames[i].status != 'RUNNING'){
                var errorob = {
                    reason: 'The game is already finished'
                }
                console.log('status: ' + allGames[i].status );
                console.log('error 400 Bad request: The game is already finished');
                res.status(400).send( errorob ).end();
                return;
            }
            usermove = yourmove;
            console.log('user move: ' + usermove);
            board = allGames[i].board;
            userteam = allGames[i].userteam;
            
            var validate;
            var movearr = usermove.split('');
            var lastarr = board.split('');
            var empty = 0, x = 0, o = 0, changes=0, newmove;

            if(movearr.length!=9) { // error 400 Bad request
                var errorob = {
                    reason: 'Board lenght is not 9'
                }
                console.log('board.length: ' + movearr.length);
                console.log('error 400 Bad request: Board lenght is not 9');
                res.status(400).send( errorob ).end();
                validate = 'ERROR';
                break;
            }

            
            var j;
            for(j=0; j < movearr.length; j++){
                if(movearr[j]!=lastarr[j]){
                    changes++;
                    newmove = movearr[j];
                }
                switch (movearr[j]) {
                    case '-':
                        empty++;
                        break;
                    case 'x':
                        x++;
                        break;
                    case 'o':
                        o++;
                        break;
                    default:
                    break;
                }

            }

            if(changes==0){ 
                var errorob = {
                    reason: 'There were no changes on the board'
                }
                console.log('-: ' + empty + ' ; x: ' + x + ' ; o: ' + o + ' ; changes: ' + changes);
                console.log('error 400 Bad request: There were no changes on the board');
                console.log('usermove: ' + usermove);
                console.log('lastmove: ' + board);
                res.status(400).send( errorob ).end(); 
                validate = 'ERROR';
                break;
            }else if(changes!=1){  // only one change is possible
                var errorob = {
                    reason: 'Only one change is possible'
                }
                console.log('-: ' + empty + ' ; x: ' + x + ' ; o: ' + o + ' ; changes: ' + changes);
                console.log('error 400 Bad request: Only one change is possible');
                console.log('usermove: ' + usermove);
                console.log('lastmove: ' + board);
                res.status(400).send( errorob ).end(); 
                validate = 'ERROR';
                break;
            }else if( newmove!= userteam ){ // that change must be the same as the userteam
                var errorob = {
                    reason: 'The change must be the same as the userteam'
                }
                console.log('-: ' + empty + ' ; x: ' + x + ' ; o: ' + o + ' ; changes: ' + changes);
                console.log('error 400 Bad request: The change must be the same as the userteam');
                console.log('userteam: ' + userteam);
                console.log('newmove: ' + newmove);
                res.status(400).send( errorob ).end(); 
                validate = 'ERROR';
                break;
            }

            validate = 'OK';
            console.log('The move is valid');
            winnerTeam = Winner(usermove); // possible responses: 'No winners', 'DRAW', 'x', 'o'
            
            switch (winnerTeam) {
                case 'No winners':
                    allGames[i].status = 'RUNNING';
                    break;
                case 'DRAW':
                    allGames[i].status = 'DRAW';
                    allGames[i].board = usermove;

                    var yourgame = {
                        id: allGames[i].id, 
                        board: allGames[i].board,
                        status: allGames[i].status
                    }

                    res.send( yourgame ).end();
                    return;
                    break;
                case 'x':
                    allGames[i].status = 'X_WON';
                    allGames[i].board = usermove;

                    var yourgame = {
                        id: allGames[i].id, 
                        board: allGames[i].board,
                        status: allGames[i].status
                    }

                    res.send( yourgame ).end();
                    return;
                    break;
                case 'o':
                    allGames[i].status = 'O_WON';
                    allGames[i].board = usermove;

                    var yourgame = {
                        id: allGames[i].id, 
                        board: allGames[i].board,
                        status: allGames[i].status
                    }

                    res.send( yourgame ).end();
                    return;
                    break;
                default:
                    break;
            }

            // case of RUNNING
            var myteam = allGames[i].computerteam;
            var mymove = move(yourmove, myteam); 
            allGames[i].board = mymove;
            winnerTeam = Winner(mymove);

            switch (winnerTeam) {
                case 'No winners':
                    allGames[i].status = 'RUNNING';
                    break;
                case 'DRAW':
                    allGames[i].status = 'DRAW';
                    break;
                case 'x':
                    allGames[i].status = 'X_WON';
                    break;
                case 'o':
                    allGames[i].status = 'O_WON';
                    break;
                default:
                    break;
            }

            var yourgame = {
                id: allGames[i].id, 
                board: allGames[i].board,
                status: allGames[i].status
            }

            res.send( yourgame ).end();
            break;
            
        }
    }

    res.status(404).end();  

});

function Winner(move){
    var winnerteam;
    var empty = 0, x = 0, o = 0;
    var movearr = move.split(''); 
    var i, j;

    for(j=0; j < movearr.length; j++){
        switch (movearr[j]) {
            case '-':
                empty++;
                break;
            case 'x':
                x++;
                break;
            case 'o':
                o++;
                break;
            default:
            break;
        }

    }

    for(i=0; i < 9; i=i+3){     // checking the rows
        /* conditions:
            0==1 && 1==2    example: 'xxx------'
            3==4 && 4==5    example: '---ooo---'
            6==7 && 7==8    example: '------xxx'
        */      
        if(movearr[i]==movearr[i+1] && movearr[i+1]==movearr[i+2] && movearr[i]!='-'){
            console.log('We have a winner!');
            console.log('Boxes: ' + i + ' - ' + (i+1) + ' - ' + (i+2));
            winnerteam = movearr[i];
            console.log('Winner team: ' + winnerteam);
            return winnerteam;
        }
    }

    for(i=0; i < 3; i++){     // checking the columns
        /* conditions:
            0==3 && 3==6    example: 'x--x--x--'
            1==4 && 4==7    example: '-x--x--x-'
            2==5 && 5==8    example: '--o--o--o'
        */      
        if(movearr[i]==movearr[i+3] && movearr[i+3]==movearr[i+6] && movearr[i]!='-'){
            console.log('We have a winner!');
            console.log('Boxes: ' + (i) + ' - ' + (i+3) + ' - ' + (i+6));
            winnerteam = movearr[i];
            console.log('Winner team: ' + winnerteam);
            return winnerteam;
        }
    }

    // checking the diagonals
    // 0==4 && 4==8
    if(movearr[0]==movearr[4] && movearr[4]==movearr[8] && movearr[0]!='-'){
        console.log('We have a winner!');
        console.log('Boxes: ' + 0 + ' - ' + 4 + ' - ' + 8);
        winnerteam = movearr[0];
        console.log('Winner team: ' + winnerteam);
        return winnerteam;
    }
    
    //2==4 && 4==6
    if(movearr[2]==movearr[4] && movearr[4]==movearr[6] && movearr[2]!='-'){
        console.log('We have a winner!');
        console.log('Boxes: ' + 2 + ' - ' + 4 + ' - ' + 6);
        winnerteam = movearr[2];
        console.log('Winner team: ' + winnerteam);
        return winnerteam;
    }	

    if(empty==0){
        console.log('DRAW');
        return 'DRAW';
    }

    console.log('No winners yet');
    return 'No winners';
}

router.delete('/api/v1/games/:uuid',(req,res) => {  // Delete a game

    var id = req.params.uuid;

    console.log(allGames);
    for(i=0; i< allGames.length; i++){
        if( allGames[i].id == id){
            allGames.splice(i, 1);
            console.log('Game id '+ id +' successfully deleted');
            console.log(allGames);
            res.status(200).end();
            break;  
        }
    }
    res.status(404).end();
});

router.get('/api/v1/games',(req,res) => {  // Get all games

   var yourgames = [];

    for(i=0; i< allGames.length; i++){
        var game = {
            id: allGames[i].id, 
            board: allGames[i].board,
            status: allGames[i].status
        }
        yourgames.push(game);

    }

    res.send( yourgames );

});

app.use("/", router);

