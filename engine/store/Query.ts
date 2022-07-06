import { StarlightStore } from "./Store";

export class StarlightQuery{
    public store:StarlightStore;
    public constructor(store:StarlightStore){
        this.store = store;
    }
}