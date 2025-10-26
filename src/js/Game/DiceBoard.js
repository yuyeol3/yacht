import Publisher from "../Publisher";

export default class DiceBoard {
    constructor() {
        this.publisher = new Publisher();
        this.isRolling = false;
        this.rollingTimer = null;
        this.reset();
    }


    roll() {
        // legacy one-shot roll, defer to start/stop behavior for compatibility
        if (this.chanceCount === 0 || this.isRolling) return;
        this.startRoll();
        setTimeout(()=>this.stopRoll(), 500);
    }

    startRoll() {
        if (this.chanceCount === 0 || this.isRolling) return;
        const num = 5 - this.selectedCount;
        if (num <= 0) return;

        this.isRolling = true;
        this.publisher.notify({ isRolling: true });

        this.rollingTimer = setInterval(() => {
            const result = [];
            for (let i = 0; i < num; i++) {
                result.push(Math.floor(Math.random() * 6) + 1);
            }
            this.rolledDice = result;
            this.publisher.notify({
                rolledDice: this.rolledDice,
                selected: this.selected,
                leftCount: this.chanceCount,
                isRolling: true
            });
        }, 100);
    }

    stopRoll() {
        if (!this.isRolling) return;
        if (this.rollingTimer) {
            clearInterval(this.rollingTimer);
            this.rollingTimer = null;
        }
        // finalize result if somehow missing
        if (!this.rolledDice || this.rolledDice.length === 0) {
            const num = 5 - this.selectedCount;
            const result = [];
            for (let i = 0; i < num; i++) {
                result.push(Math.floor(Math.random() * 6) + 1);
            }
            this.rolledDice = result;
        }
        this.isRolling = false;
        this.chanceCount--;
        this.publisher.notify({
            rolledDice: this.rolledDice,
            leftCount: this.chanceCount,
            isRolling: false,
            dropAnimation: true
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
        if (this.rolledDice === null || this.isRolling) return;
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
        if (this.selectedCount == 0 || this.isRolling) return;

        this.rolledDice.push(this.selected[idx]);
        this.selected[idx] = 0;
        this.selectedCount--;
        this.publisher.notify({
            rolledDice : this.rolledDice,
            selected: this.selected
        })
    }

    reset() {
        if (this.rollingTimer) {
            clearInterval(this.rollingTimer);
            this.rollingTimer = null;
        }
        this.isRolling = false;
        this.selected = [0, 0, 0, 0, 0];
        this.selectedCount = 0;
        this.rolledDice = null;
        this.chanceCount = 3;
        this.publisher.notify({
            rolledDice : [0, 0, 0, 0, 0],
            selected: [0, 0, 0, 0, 0],
            leftCount : this.chanceCount,
            isRolling: false
        })
    }

}
