/**
 * Created by Jairo Martinez on 5/7/14.
 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('ControllerEvent', {
		uuid:        {type: DataTypes.STRING, defaultValue: '000000000000', allowNull: false},
		event:       {type: DataTypes.STRING, defaultValue: 'WAITING', allowNull: false},
		state:       {type: DataTypes.STRING, defaultValue: 'unknown', allowNull: false},
		duration:    {type: DataTypes.STRING, defaultValue: '00:00.00', allowNull: true},
		createdAt:   {type: DataTypes.DATE, allowNull: true},
		updatedAt:   {type: DataTypes.DATE, allowNull: true}
	}, {
		tableName:  'controllerEvents',
		timestamps: true
	});
};
