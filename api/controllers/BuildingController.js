/*---------------------
	:: Building 
	-> controller
---------------------*/
var BuildingController = {

	getStorageDetails: function(req, res) {
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*' // implementation of CORS
		});
		// we retrieve all informations for building storage popup
		var buildingId = req.param("id");
		if (buildingId) {
			Building.find(buildingId).done(function(err, building) {
				if (!err) {
					// BuildingTemplate
					BuildingTemplate.find(building.buildingTemplateId).done(function(err, tpl) {
						if (!err) {
							// harvestings
							Harvesting.findAll({
								playerId: req.session.player.id
							}).done(function(err, harvestings) {
								if (!err) {
									// storage items
									StorageItem.findAll({
										buildingId: building.id
									}).done(function(err, items) {
										if (!err) {
											// HERE WE ARE GOOD :)
											tpl.values = undefined;
											items.values = undefined;
											harvestings.values = undefined;
											building.values = undefined;
											res.end(JSON.stringify({
												success: true,
												message: "Building storage details",
												error: null,
												template: tpl,
												storedItems: items,
												harvestings: harvestings,
												building: building
											}));
										} else {
											res.end(JSON.stringify({
												success: false,
												message: "Error during retrieving list of storage items",
												error: err
											}));
										}
									});
								} else {
									res.end(JSON.stringify({
										success: false,
										message: "Error during retrieving list of harvestings",
										error: err
									}));
								}
							});
						} else {
							res.end(JSON.stringify({
								'success': false,
								'message': 'error occured during building template finding',
								'error': err
							}));
						}
					});
				} else {
					res.end(JSON.stringify({
						success: false,
						message: "Error during building finding",
						error: null
					}));
				}
			});
		} else {
			res.end(JSON.stringify({
				success: false,
				message: "parameters missing",
				error: null
			}));
		}
	},
	// TODO : CHECK CAPACITY
	storeHarvesting: function(req, res) {
		if (req.isAjax) {
			res.writeHead(200, {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*' // implementation of CORS
			});

			if (req.param('harvestingId') && req.param('buildingId') && req.param("buildingTemplateId")) {
				var harvestingIdParam = req.param('harvestingId'),
					buildingIdParam = req.param('buildingId');

				Building.find(buildingIdParam).done(function(err, building) {
					if (!err) {
						// we rerieve building template details to check capacity 
						BuildingTemplate.find(building.buildingTemplateId).done(function(err, tpl) {
							if (!err) {
								// we retrieve future stored harvesting
								Harvesting
									.find(harvestingIdParam)
									.done(function(err, harvesting) {
									if (!err) {
										// we check quantity/capacity
										if (harvesting.quantity + building.currentStorageCapacity < tpl.storageCapacity) {
											// Update capacity
											newQuantity = building.currentStorageCapacity + harvesting.quantity;
											console.log(newQuantity);
											Building.update({
												id: buildingIdParam
											}, {
												currentStorageCapacity: newQuantity
											},
											function(err, building) {
												// Error handling
												if (err) {
													return console.log(err);
													// Updated user successfully!
												} else {
													console.log("Building updated:", building);
												}
											});

											// CREATION OF THE STORAGE ITEM
											StorageItem.create({
												name: harvesting.name,
												quantity: harvesting.quantity,
												playerId: req.session.player.id,
												cropTemplateId: harvesting.cropTemplateId,
												buildingId: buildingIdParam
											}).done(function(err, item) {
												Harvesting.findAll({
													playerId: req.session.player.id
												}).done(function(err, harvestings) {
													if (!err) {
														// storage items
														StorageItem.findAll({
															buildingId: building.id
														}).done(function(err, items) {
															if (!err) {
																// we destroy old harvesting
																building.currentStorageCapacity = newQuantity;
																Harvesting.destroy(harvestingIdParam, function(err) {
																	if (!err) {
																		res.end(JSON.stringify({
																			success: true,
																			message: "StorageItem created",
																			error: null,
																			template: tpl,
																			item: item,
																			storedItems: items,
																			harvestings: harvestings,
																			building: building
																		}));
																	} else {
																		res.end(JSON.stringify({
																			success: false,
																			message: "Error during Harvesting deleting",
																			error: err
																		}));
																	}
																});
															} else {
																res.end(JSON.stringify({
																	success: false,
																	message: "Error during StorageItem creation",
																	error: err
																}));
															}
														});
													} else {
														res.end(JSON.stringify({
															success: false,
															message: "Error during retrieving list of storage items",
															error: err
														}));
													}
												});
											});
										} else {
											res.end(JSON.stringify({
												success: false,
												message: "Storage item quantity is too important for this building",
												error: err
											}));
										}
									} else {
										res.end(JSON.stringify({
											success: false,
											message: "Error during storeHarvesting (finding harvestign)",
											error: err
										}));
									}
								});
							} else {
								res.end(JSON.stringify({
									success: false,
									message: "Error during finding building template",
									error: err
								}));
							}
						});
					} else {
						res.end(JSON.stringify({
							success: false,
							message: "Building unfound",
							error: err
						}));
					}
				});

			} else {
				res.end(JSON.stringify({
					success: false,
					message: "parameters missing",
					error: null
				}));
			}

		} else {
			res.redirect('/');
		}
	}
};
module.exports = BuildingController;