import { Player } from "./Player";
import Publisher from "../Publisher";

class Scores {
    constructor() {
        this.ones = null;
        this.twos = null;
        this.threes = null;
        this.fours = null;
        this.fives = null;
        this.sixes = null;
        this.choice = null;
        this.four_of_a_kind = null;
        this.full_house = null;
        this.s_straight = null;
        this.l_straight = null;
        this.yacht = null;
        this.bonus = null;
        this.bonusCrit = 0;
        this.total = 0;
    }

    /**
     * @param {string} name 
     * @param {number} score 
     * @returns {number} 확정된 점수
     */
    setScore(name, score) {
        // 이미 확정된 점수를 변경하는 것 금지
        if (this[name] !== null) return [false, 0];
        let added = 0;
        this[name] = Number(score);
        added += Number(score);
        this.total += score;
        if (["ones", "twos", "threes", "fours", "fives", "sixes"].includes(name)) {
            this.bonusCrit += score;
        }

        if (this.bonusCrit >= 63 && this.bonus === null) {
            this.bonus = 35;
            added += 35;
            this.total += this.bonus;
        }
        return [true, added];
    }

    getScore(name) {
        return this[name];
    }
}

export default class ScoreBoard {
    /**
     * @param {Player[]} players 
     */
    constructor(players) {
        this.players = players;
        /**
         * @type {Scores[]}
         */
        this.scoreBoard = [];

        for (let i = 0; i < players.length; i++) {
            this.scoreBoard.push(new Scores());
        }

        this.turnScoreResult = null;
        this.publisher = new Publisher();
    }

    /**
     * @param {number} user_id 
     * @param {string} selected_category 
     * @returns {boolean} 점수 확정 성공여부
     */
    confirmScore(user_id, selected_category) {
        const result = this.scoreBoard[user_id]
                    .setScore(selected_category, this.turnScoreResult[selected_category]);
        if (result[0] === true) {
            this.players[user_id].score += result[1];
            this.turnScoreResult = null;
            this.publisher.notify({
                scoreBoard : this.scoreBoard,
                possibleScores : null
            })
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * @param {number[]} rollResult 
     */
    calcScores(rollResult) {
        const scoreTable = [0, 0, 0, 0, 0, 0, 0];

        for (let i = 0; i < rollResult.length; i++) {
            scoreTable[rollResult[i]]++;
        }
        console.log("calcScores", rollResult, scoreTable);

        const result = new Scores();

        result.ones   = scoreTable[1] * 1;
        result.twos   = scoreTable[2] * 2;
        result.threes = scoreTable[3] * 3;
        result.fours  = scoreTable[4] * 4;
        result.fives  = scoreTable[5] * 5;
        result.sixes  = scoreTable[6] * 6;

        result.choice = 0;
        for (let i = 1; i <= 6; i++) {
            result.choice += scoreTable[i] * i;
        }

        for (let i = 1; i <= 6; i++) {
            if (scoreTable[i] >= 4) {
                result.four_of_a_kind = result.choice;
                break;
            }
        }

        for (let i = 1; i <= 6; i++) {
            for (let j = i + 1; j <= 6; j++) {
                if (scoreTable[i] == 2 && scoreTable[j] == 3 ||
                    scoreTable[i] == 3 && scoreTable[j] == 2) {
                        result.full_house = result.choice;
                        break;
                    }
            }
        }

        if (scoreTable[1] && scoreTable[2] && scoreTable[3] && scoreTable[4] ||
            scoreTable[2] && scoreTable[3] && scoreTable[4] && scoreTable[5] ||
            scoreTable[3] && scoreTable[4] && scoreTable[5] && scoreTable[6]
        )
            result.s_straight = 15;

        if (scoreTable[1] && scoreTable[2] && scoreTable[3] && scoreTable[4] && scoreTable[5] ||
            scoreTable[2] && scoreTable[3] && scoreTable[4] && scoreTable[5] && scoreTable[6]
        )
            result.l_straight = 30;

        for (let i = 1; i <= 6; i++) {
            if (scoreTable[i] == 5) {
                result.yacht = 50;
            }
        }

        let maxName = "";
        let maxPoint = 0;
        for (const k of Object.keys(result)) {
            if (
                k !== null &&
                !["ones", "twos", "threes", "fours", "fives", "sixes", "choice"].includes(k) &&
                result[k] != null &&
                result[k] > maxPoint
            ) {
                maxPoint = result[k];
                maxName = k.replaceAll("_", " ").toUpperCase();
            }
        }

        this.turnScoreResult = result;
        this.publisher.notify({
            possibleScores : result,
            bestCategoryName : maxName
        })
    }
};
