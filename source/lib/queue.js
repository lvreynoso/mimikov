// queue.js

class Queue {
    constructor(size) {
        this.data = [];
        this.limit = size;
    }

    length() {
        return this.data.length;
    }

    enqueue(item) {
        if (this.length() == this.limit) {
            this.data.pop();
        }
        this.data.unshift(item);
    }

    dequeue(item) {
        if (this.length() == 0) {
            return undefined;
        } else {
            let item = this.data.pop();
            return item;
        }
    }

    items() {
        let allItemsArray = this.data.map(element => { return element });
        allItemsArray.reverse()
        return allItemsArray;
    }
}

export default Queue;
