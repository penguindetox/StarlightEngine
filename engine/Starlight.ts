import { StarlightSettings } from "./StarlightSettings";
import express from 'express';
import http from 'http';
import socketio from 'socket.io';
import { StarlightStore } from "./store/Store";
import { memoryUsage } from "process";

export class StarlightEngine{
    private app: express.Application = express();
    private server:http.Server = http.createServer(this.app);
    public store: StarlightStore = new StarlightStore(this);
    public io:socketio.Server = new socketio.Server(this.server);

    public settings:StarlightSettings = {"clusterId":"none","document":true,"inMemory":false};
    public constructor(settings?:StarlightSettings){
        if(settings){
            this.settings = settings;
        }
        this.start();
    }

    public log(message:string){
        if(this.settings.log){
            console.log(message);
        }
    }

    public async start(){
        this.run();
    }

    public async run(){
        this.createRoutes();
        this.createConnections();

        this.server.listen(process.env.PORT || 4555,async function(){
            console.log(`Starlight node started!`);
        });
    }

    private async createRoutes(){
        const origin = this;
        this.app.use(express.json());
        this.app.get('/stats',async function(req,res,next){
            const usage = memoryUsage();
            res.send(`Current memory usage: ${usage.heapUsed / 1000000}MB / ${usage.heapTotal / 1000000}MB \n`);
        });

        this.app.get('/settings',async function(req,res,next){

        });

        this.app.post('/save',async function(req,res,next){
            if(req.body.id && req.body.data){
               const save = await origin.store.save(req.body.id,req.body.data);

               origin.io.emit('dataChange',save);
               res.json({'status':'success',save});
            }else{
                res.json({'status':'insufficentdata'});
            }
            
        });

        this.app.get('/save/:id',async function(req,res,next){
            const save = await origin.store.getById(req.params.id);

            res.json({'status':'success',save});
        });
        
    }

    private async createConnections(){
        this.io.on("connection",async (socket) => {
            socket.on('save',async (data) =>{
                if(data.id && data.data){
                    const datastore = await this.store.save(data.id,data.data);

                    this.io.emit('dataChange',datastore);
                }
            });

            socket.on('readid',async (data) =>{
                if(data.id){
                    const doc = await this.store.getById(data.id);

                    this.io.emit('documentById',doc);
                }
            });
        })
    }
}