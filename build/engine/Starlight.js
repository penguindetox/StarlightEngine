"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarlightEngine = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const Store_1 = require("./store/Store");
const process_1 = require("process");
class StarlightEngine {
    constructor(settings) {
        this.app = (0, express_1.default)();
        this.server = http_1.default.createServer(this.app);
        this.store = new Store_1.StarlightStore(this);
        this.io = new socket_io_1.default.Server(this.server);
        this.settings = { "clusterId": "none", "document": true, "inMemory": false };
        if (settings) {
            this.settings = settings;
        }
        this.start();
    }
    log(message) {
        if (this.settings.log) {
            console.log(message);
        }
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.run();
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.createRoutes();
            this.createConnections();
            this.server.listen(process.env.PORT || 4555, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(`Starlight node started!`);
                });
            });
        });
    }
    createRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            const origin = this;
            this.app.use(express_1.default.json());
            this.app.get('/stats', function (req, res, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    const usage = (0, process_1.memoryUsage)();
                    res.send(`Current memory usage: ${usage.heapUsed / 1000000}MB / ${usage.heapTotal / 1000000}MB \n`);
                });
            });
            this.app.get('/settings', function (req, res, next) {
                return __awaiter(this, void 0, void 0, function* () {
                });
            });
            this.app.post('/save', function (req, res, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (req.body.id && req.body.data) {
                        const save = yield origin.store.save(req.body.id, req.body.data);
                        origin.io.emit('dataChange', save);
                        res.json({ 'status': 'success', save });
                    }
                    else {
                        res.json({ 'status': 'insufficentdata' });
                    }
                });
            });
            this.app.get('/save/:id', function (req, res, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    const save = yield origin.store.getById(req.params.id);
                    res.json({ 'status': 'success', save });
                });
            });
        });
    }
    createConnections() {
        return __awaiter(this, void 0, void 0, function* () {
            this.io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
                socket.on('save', (data) => __awaiter(this, void 0, void 0, function* () {
                    if (data.id && data.data) {
                        const datastore = yield this.store.save(data.id, data.data);
                        this.io.emit('dataChange', datastore);
                    }
                }));
                socket.on('readid', (data) => __awaiter(this, void 0, void 0, function* () {
                    if (data.id) {
                        const doc = yield this.store.getById(data.id);
                        this.io.emit('documentById', doc);
                    }
                }));
            }));
        });
    }
}
exports.StarlightEngine = StarlightEngine;
