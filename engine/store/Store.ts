import { StarlightEngine } from "../Starlight";
import fs from 'fs/promises';
import { StarlightQuery } from "./models/Query";
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

    public async save(id:string,data:any,collection:string = "default"){
        if(this.engine.settings.inMemory){
            return await this.saveInMemory(id,data,collection);
        }else{
            return await this.saveInFile(id,data,collection);
        }
    }

    private async saveInFile(id:string,data:any,collection:string){
        

        if(!this.dirExists){
            var dir = await fs.readdir(`./store/${collection}`).catch(e =>{console.log(`An error had occured: ${e}`);return false});
            if(dir){
                this.dirExists = true;
            }else{
                await fs.mkdir('./store/collection');
                this.dirExists = true;
            }
        }

        if(this.engine.settings.document && this.dirExists){
            try{
                const fileData = JSON.stringify(data);
                const file = await fs.writeFile(`./store/${collection}/` + id +".stf",fileData).then(val => true).catch(e =>{console.log(`An error had occured: ${e}`);return false});

                return {'saved':file,size:sizeof(data),data,id,'type':"doc"}
            }catch(e){
                return {'saved':false}
            }
            
        }else if(!this.engine.settings.document && this.dirExists){
            const file = await fs.writeFile(`./store/${collection}/` + id + ".stk",String(data)).then(val => true).catch(e =>{console.log(`An error had occured: ${e}`);return false});

            return {'saved':file,size:sizeof(data),data,id,'type':"keypair"}
        }
    }

    private async saveInMemory(id:string,data:any,collection:string){
        if(this.engine.settings.document){
            try{
                if(!this.documents[collection]){
                    this.documents[collection] = {};
                }
                this.documents[collection][id] = JSON.stringify(data);

                return {saved:true,size:sizeof(data),data,id,'type':"document"};
            }catch(e){
                console.log(`An error had occured: ${e}`);

                return {saved:false};
            }

        }else{
            if(!this.keypair[collection]){
                this.keypair[collection] = {};
            }
            this.keypair[collection][id] = data;
            return {saved:true,size:sizeof(data),data,id,'type':"keypair"};
        }
    }

    public async getById(id:string,collection:string = "default"){
        if(this.engine.settings.inMemory){
            return this.getByIdFromMemory(id,collection);
        }else{
            return this.getByIdFromFile(id,collection);
        }
    }

    private async getByIdFromMemory(id:string,collection:string){
        if(this.engine.settings.document){
            try{
                return {id,data:JSON.parse(this.documents[collection][id])};
            }catch{ 
                return false;
            }
            
        }else{
            return this.keypair[collection][id];
        }
        
    }

    private async getByIdFromFile(id:string,collection:string){
        if(this.engine.settings.document){
            var file = await fs.readFile(`./store/${collection}/${id}.stf`).catch(e =>{console.log(`An error had occured: ${e}`);return false});

            if(file && file != true){
                return {id,data:JSON.parse(file.toString()),'type':'document'};
            }else{
                return false;
            }
        }else{
            var file = await fs.readFile(`./store/${collection}/${id}.stk`).catch(e =>{console.log(`An error had occured: ${e}`);return false});

            if(file && file != true){
                return {id,data:file.toString(),'type':'keypair'};
            }else{
                return false;
            }
        }
    }
}