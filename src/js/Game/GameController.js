import Publisher from "../Publisher";
import DiceBoard from "./DiceBoard";
import Game from "./Game";
import { Player } from "./Player";
import ScoreBoard from "./ScoreBoard";

class GameController {

    constructor() {
        this.game = null;
        this.diceBoard = null;
        this.scoreBoard = null;
        this.players = [];
        this.publisher = null;
    }

    initialize(players) {
        this.players = players;
        this.game = new Game(players);
        this.scoreBoard = new ScoreBoard(players);
        this.diceBoard = new DiceBoard();
        this.publisher = new Publisher();

        this.publisher.notify({
            players : this.players
        });
    }

    /**
     * 
     * @returns {Player[]}
     */
    getPlayes() {
        return this.players;
    }

    getGame() {
        return this.game;
    }

    getScoreBoard() {
        return this.scoreBoard;
    }

    getDiceBoard() {
        return this.diceBoard;
    }

    roll() {
        this.diceBoard.roll();
        this.scoreBoard.calcScores(this.diceBoard.getDiceStatus());
    }

    /**
     * @param {string} selected_category 
     */
    confirmScore(selected_category) {
        if (this.scoreBoard.confirmScore(this.game.getTurn(), selected_category)) {
            this.diceBoard.reset();
            this.game.nextTurn();
        }
    }
    /**
     * @param {number} id 
     */
    keepDice(id) {
        this.diceBoard.keepDice(id);
    }

    /**
     * @param {number} id 
     */
    unkeepDice(id) {
        this.diceBoard.unkeepDice(id);
    }
}

export const gameController = new GameController();