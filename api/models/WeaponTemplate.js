/*---------------------
	:: WeaponTemplate
	-> model
---------------------*/
module.exports = {
	attributes: {
		name: 'TEXT',
		damage: 'INT',
		hitRatio: 'INT',
		hitPerSecond: 'INT',
		price: 'FLOAT',
		// game related properties
		centerp: 'TEXT',
		rot: 'TEXT',
		x: 'INT',
		y: 'INT',
		img64: 'TEXT'
	}
};