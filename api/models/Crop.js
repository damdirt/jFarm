/*---------------------
	:: Crop
	-> model
---------------------*/
module.exports = {

	attributes	: {
		name: 'TEXT',
		ownerId: 'INT',
		maturityLevel: 'INT',
		healthLevel: 'FLOAT',
		x: 'INT',
		y: 'INT',
		cornerYard: 'TEXT',
		cropTemplateId: 'INT',
		content: 'TEXT',
		yardId: 'INT',
		objectType: 'TEXT'
	}

};