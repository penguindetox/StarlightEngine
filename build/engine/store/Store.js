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
exports.StarlightStore = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const Query_1 = require("./Query");
const object_sizeof_1 = __importDefault(require("object-sizeof"));
class StarlightStore {
    constructor(engine) {
        this.dirExists = false;
        this.keypair = {};
        this.documents = {};
        this.engine = engine;
        this.query = new Query_1.StarlightQuery(this);
    }
    save(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.engine.settings.inMemory) {
                return yield this.saveInMemory(id, data);
            }
            else {
                return yield this.saveInFile(id, data);
            }
        });
    }
    saveInFile(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.dirExists) {
                var dir = yield promises_1.default.readdir('./store').catch(e => { console.log(`An error had occured: ${e}`); return false; });
                if (dir) {
                    this.dirExists = true;
                }
                else {
                    yield promises_1.default.mkdir('./store');
                    this.dirExists = true;
                }
            }
            if (this.engine.settings.document && this.dirExists) {
                try {
                    const fileData = JSON.stringify(data);
                    const file = yield promises_1.default.writeFile("./store/" + id + ".stf", fileData).then(val => true).catch(e => { console.log(`An error had occured: ${e}`); return false; });
                    return { 'saved': file, size: (0, object_sizeof_1.default)(data), data, id, 'type': "doc" };
                }
                catch (e) {
                    return { 'saved': false };
                }
            }
            else if (!this.engine.settings.document && this.dirExists) {
                const file = yield promises_1.default.writeFile("./store/" + id + ".stk", String(data)).then(val => true).catch(e => { console.log(`An error had occured: ${e}`); return false; });
                return { 'saved': file, size: (0, object_sizeof_1.default)(data), data, id, 'type': "keypair" };
            }
        });
    }
    saveInMemory(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.engine.settings.document) {
                try {
                    this.documents[id] = JSON.stringify(data);
                    return { saved: true, size: (0, object_sizeof_1.default)(data), data, id, 'type': "document" };
                }
                catch (e) {
                    console.log(`An error had occured: ${e}`);
                    return { saved: false };
                }
            }
            else {
                this.keypair[id] = data;
                return { saved: true, size: (0, object_sizeof_1.default)(data), data, id, 'type': "keypair" };
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.engine.settings.inMemory) {
                return this.getByIdFromMemory(id);
            }
            else {
                return this.getByIdFromFile(id);
            }
        });
    }
    getByIdFromMemory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.engine.settings.document) {
                return JSON.parse(this.documents[id]);
            }
            else {
                return this.keypair[id];
            }
        });
    }
    getByIdFromFile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.engine.settings.document) {
                var file = yield promises_1.default.readFile(`./store/${id}.stf`).catch(e => { console.log(`An error had occured: ${e}`); return false; });
                if (file && file != true) {
                    return { id, data: JSON.parse(file.toString()), 'type': 'document' };
                }
                else {
                    return false;
                }
            }
            else {
                var file = yield promises_1.default.readFile(`./store/${id}.stk`).catch(e => { console.log(`An error had occured: ${e}`); return false; });
                if (file && file != true) {
                    return { id, data: file.toString(), 'type': 'keypair' };
                }
                else {
                    return false;
                }
            }
        });
    }
}
exports.StarlightStore = StarlightStore;
