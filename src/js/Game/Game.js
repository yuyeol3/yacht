import Publisher from "../Publisher";
import { Player } from "./Player";

export default class Game {
    /**
     * 
     * @param {Player[]} players 
     */
    constructor(players) {
        this.round = 1;
        this.turn = 0;
        this.players = players;
        this.publisher = new Publisher();
        this.notify();
    }

    notify() {
        this.publisher.notify({
            whoseTurn : this.players[this.turn].name,
            round : this.round
        });
    }

    getRound() {
        return this.round;
    }

    getTurn() {
        return this.turn;
    }

    nextTurn() {
        this.turn++;
        if (this.turn == this.players.length) {
            this.nextRound();
        }
        else {
            this.notify();
        }
    }

    nextRound() {
        this.turn = 0;
        this.round++;
        if (this.round == 13) {
            this.finishGame();
        }
        else {
            this.notify();
        }
    }

    finishGame() {
        const ranking = [...this.players];
        ranking.sort((a, b)=>b.score-a.score);

        this.publisher.notify({
            gameFinished : true,
            ranking : ranking
        });
    }

}