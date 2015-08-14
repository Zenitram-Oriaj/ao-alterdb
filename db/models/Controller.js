/**
 * Created by Jairo Martinez on 5/7/14.
 */

module.exports = function (sequelize, DataTypes) {
	var Controller = sequelize.define('Controller', {
			uuid:            {type: DataTypes.STRING, defaultValue: '', allowNull: true},
			workspaceUuid:   {type: DataTypes.STRING, defaultValue: null, allowNull: true},
			workspaceName:   {type: DataTypes.STRING, defaultValue: null, allowNull: true},
			floorId:         {type: DataTypes.STRING, defaultValue: null, allowNull: true},
			locationId:      {type: DataTypes.STRING, defaultValue: null, allowNull: true},
			regionId:        {type: DataTypes.STRING, defaultValue: null, allowNull: true},
			description:     {type: DataTypes.STRING, defaultValue: null, allowNull: true},
			ip:              {type: DataTypes.STRING, defaultValue: null, allowNull: true, validate: sequelize.isIP},
			port:            {type: DataTypes.INTEGER, defaultValue: 80, allowNull: true},
			firmware:        {type: DataTypes.STRING, defaultValue: null, allowNull: true},
			uptime:          {type: DataTypes.STRING, defaultValue: null, allowNull: true},
			prevUptime:      {type: DataTypes.STRING, defaultValue: null, allowNull: true},
			lapseCount:      {type: DataTypes.INTEGER, defaultValue: 0, allowNull: true},
			rebootCount:     {type: DataTypes.INTEGER, defaultValue: 0, allowNull: true},
			autoReboot:      {type: DataTypes.INTEGER, defaultValue: 0, allowNull: true},
			rebootAt:        {type: DataTypes.DATE, allowNull: true},
			gw:              {type: DataTypes.STRING, defaultValue: null, allowNull: true, validate: sequelize.isIP},
			subnet:          {type: DataTypes.STRING, defaultValue: null, allowNull: true},
			dns:             {type: DataTypes.STRING, defaultValue: null, allowNull: true, validate: sequelize.isIP},
			state:           {type: DataTypes.INTEGER, defaultValue: 0, allowNull: true},
			prevState:       {type: DataTypes.INTEGER, defaultValue: 0, allowNull: true},
			status:          {type: DataTypes.STRING, defaultValue: 'OFFLINE', allowNull: true},
			password:        {type: DataTypes.STRING, defaultValue: 'boi123', allowNull: true},
			mode:            {type: DataTypes.STRING, defaultValue: 'A', allowNull: true},
			timeout:         {type: DataTypes.INTEGER, defaultValue: 0, allowNull: true},
			heartbeat:       {type: DataTypes.INTEGER, defaultValue: 300, allowNull: true},
			heartbeatAt:     {type: DataTypes.DATE, allowNull: true},
			prevHeartbeatAt: {type: DataTypes.DATE, allowNull: true},
			eventAt:         {type: DataTypes.DATE, allowNull: true},
			prevEventAt:     {type: DataTypes.DATE, allowNull: true},
			createdAt:       {type: DataTypes.DATE, allowNull: true},
			updatedAt:       {type: DataTypes.DATE, allowNull: true}
		}, {
			instanceMethods: {
				lastUpdate: function () {
					var dt = new Date();
					var offset = dt.getTime() - this.updatedAt.getTime();
					var refVal = (6 * 60 * 1000);
					return (offset > refVal);
				},
				lastEvent:  function () {
					return {
						state:   this.state,
						eventAt: this.eventAt
					};
				}
			},
			tableName:       'controllers',
			timestamps:      true
		}
	);

	return Controller;
};
