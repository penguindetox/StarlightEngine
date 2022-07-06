import { StarlightEngine } from "../Starlight";
import fs from 'fs/promises';
import { StarlightQuery } from "./Query";
import sizeof from 'object-sizeof';

export class StarlightStore{
    public engine:StarlightEngine;
    public query:StarlightQuery;
    private dirExists:boolean = false;
    public keypair:any = {};
    public documents:any ={};

    public constructor(engine:StarlightEngine){
        this.engine = engine;
        this.query = new StarlightQuery(this);
    }

    public async save(id:string,data:any){
        if(this.engine.settings.inMemory){
            return await this.saveInMemory(id,data);
        }else{
            return await this.saveInFile(id,data);
        }
    }

    private async saveInFile(id:string,data:any){
        

        if(!this.dirExists){
            var dir = await fs.readdir('./store').catch(e =>{console.log(`An error had occured: ${e}`);return false});
            if(dir){
                this.dirExists = true;
            }else{
                await fs.mkdir('./store');
                this.dirExists = true;
            }
        }

        if(this.engine.settings.document && this.dirExists){
            try{
                const fileData = JSON.stringify(data);
                const file = await fs.writeFile("./store/" + id +".stf",fileData).then(val => true).catch(e =>{console.log(`An error had occured: ${e}`);return false});

                return {'saved':file,size:sizeof(data),data,id,'type':"doc"}
            }catch(e){
                return {'saved':false}
            }
            
        }else if(!this.engine.settings.document && this.dirExists){
            const file = await fs.writeFile("./store/" + id + ".stk",String(data)).then(val => true).catch(e =>{console.log(`An error had occured: ${e}`);return false});

            return {'saved':file,size:sizeof(data),data,id,'type':"keypair"}
        }
    }

    private async saveInMemory(id:string,data:any){
        if(this.engine.settings.document){
            try{
                this.documents[id] = JSON.stringify(data);

                return {saved:true,size:sizeof(data),data,id,'type':"document"};
            }catch(e){
                console.log(`An error had occured: ${e}`);

                return {saved:false};
            }

        }else{
            this.keypair[id] = data;
            return {saved:true,size:sizeof(data),data,id,'type':"keypair"};
        }
    }

    public async getById(id:string){
        if(this.engine.settings.inMemory){
            return this.getByIdFromMemory(id);
        }else{
            return this.getByIdFromFile(id);
        }
    }

    private async getByIdFromMemory(id:string){
        if(this.engine.settings.document){
            try{
                return {id,data:JSON.parse(this.documents[id])};
            }catch{ 
                return false;
            }
            
        }else{
            return this.keypair[id];
        }
        
    }

    private async getByIdFromFile(id:string){
        if(this.engine.settings.document){
            var file = await fs.readFile(`./store/${id}.stf`).catch(e =>{console.log(`An error had occured: ${e}`);return false});

            if(file && file != true){
                return {id,data:JSON.parse(file.toString()),'type':'document'};
            }else{
                return false;
            }
        }else{
            var file = await fs.readFile(`./store/${id}.stk`).catch(e =>{console.log(`An error had occured: ${e}`);return false});

            if(file && file != true){
                return {id,data:file.toString(),'type':'keypair'};
            }else{
                return false;
            }
        }
    }
}