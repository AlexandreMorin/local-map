/**
 * Created by msalvi on 01/09/2016.
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
    var State = sequelize.define("State", {
        sta_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING
    });
    return State;
};
