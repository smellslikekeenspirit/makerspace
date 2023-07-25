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
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema
            .hasTable("Equipment")
            .then(function (exists) {
            if (exists) {
                return knex.schema.alterTable("Equipment", function (t) {
                    t.boolean("archived").defaultTo(false);
                });
            }
        })
            .then(() => __awaiter(this, void 0, void 0, function* () {
            knex.schema.hasTable("Reservations").then(function (exists) {
                if (exists) {
                    return knex.schema.alterTable("Reservations", function (t) {
                        t.boolean("archived").defaultTo(false);
                    });
                }
            });
        }));
    });
}
exports.up = up;
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema
            .hasTable("Equipment")
            .then(function (exists) {
            if (exists) {
                return knex.schema.alterTable("Equipment", function (t) {
                    t.dropColumn("archived");
                });
            }
        })
            .then(() => __awaiter(this, void 0, void 0, function* () {
            knex.schema.hasTable("Reservations").then(function (exists) {
                if (exists) {
                    return knex.schema.alterTable("Reservations", function (t) {
                        t.dropColumn("archived");
                    });
                }
            });
        }));
    });
}
exports.down = down;
//# sourceMappingURL=20220322194711_equipment-archive.js.map