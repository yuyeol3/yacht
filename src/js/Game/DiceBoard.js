import Publisher from "../Publisher";

export default class DiceBoard {
    constructor() {
        this.publisher = new Publisher();
        this.reset();
    }


    roll() {
        if (this.chanceCount === 0) return;
        const num = 5 - this.selectedCount;
        if (num <= 0) return;


        const result = [];
        for (let i = 0; i < num; i++) {
            result.push(
                Math.floor(Math.random() * 6) + 1
            );
        }
        this.rolledDice = result;
        this.chanceCount--;
        console.log("rolled", result);
        this.publisher.notify({
            rolledDice: this.rolledDice,
            leftCount : this.chanceCount,
            runAnimation : (this.chanceCount < 2)
        });
    }

    /**
     * @returns {number[]}
     */
    getDiceStatus() {
        return [...this.selected.filter((e)=>e > 0), ...this.rolledDice];
    }

    /**
     * @param {number} idx 
     */
    keepDice(idx) {
        if (this.rolledDice === null) return;
        this.selectedCount++;
        for (let i = 0; i < this.selected.length; i++) {
            if (this.selected[i] == 0) {
                this.selected[i] = this.rolledDice[idx];
                break;
            }
        }
        // this.rolledDice[idx] = 0;
        this.rolledDice = this.rolledDice.filter((v, i)=>i != idx)
        this.publisher.notify({
            rolledDice : this.rolledDice,
            selected: this.selected
        })
    }

    /**
     * @param {number} idx 
     */
    unkeepDice(idx) {
        if (this.selectedCount == 0) return;

        this.rolledDice.push(this.selected[idx]);
        this.selected[idx] = 0;
        this.selectedCount--;
        this.publisher.notify({
            rolledDice : this.rolledDice,
            selected: this.selected
        })
    }

    reset() {
        this.selected = [0, 0, 0, 0, 0];
        this.selectedCount = 0;
        this.rolledDice = null;
        this.chanceCount = 3;
        this.publisher.notify({
            rolledDice : [0, 0, 0, 0, 0],
            selected: [0, 0, 0, 0, 0],
            leftCount : this.chanceCount
        })
    }

}

