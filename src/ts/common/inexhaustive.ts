export class InexhaustiveMatch extends Error {
    constructor({}: never, message="Inexhaustive Match") {
        super(message);
    }
}