(function(module) {
	"use strict";

	var User = module.parent.require('./user'),
		db = module.parent.require('../src/database'),
		meta = module.parent.require('./meta'),
		passport = module.parent.require('passport'),
		passportVK = require('passport-vkontakte').Strategy,
		fs = module.parent.require('fs'),
		path = module.parent.require('path');

	var constants = Object.freeze({
		'name': "Vkontakte",
		'admin': {
			'icon': 'fa-vk',
			'route': '/vkontakte'
		}
	});

	var vkontakte = {};

	vkontakte.getStrategy = function(strategies, callback) {
		if (meta.config['social:vkontakte:id'] && meta.config['social:vkontakte:secret']) {
			passport.use(new passportVK({
				clientID: meta.config['social:vkontakte:id'],
				clientSecret: meta.config['social:vkontakte:secret'],
				callbackURL: module.parent.require('nconf').get('url') + '/auth/vkontakte/callback'
			}, function(token, tokenSecret, params, profile, done) {
				vkontakte.login(profile.id, profile.displayName, params.email, function(err, user) {
					if (err) {
						return done(err);
					}
					done(null, user);
				});
			}));

			strategies.push({
				name: 'vkontakte',
				url: '/auth/vkontakte/',
				callbackURL: '/auth/vkontakte/callback',
				icon: 'vk fa-vk',
				scope: 'email'
			});
		}
		
		callback(null, strategies);
	};

	vkontakte.login = function(vkontakteID, username, email, callback) {
		if (!email) {
			email = username + '@users.noreply.vkontakte.com';
		}
		
		vkontakte.getUidByvkontakteID(vkontakteID, function(err, uid) {
			if (err) {
				return callback(err);
			}

			if (uid) {
				// Existing User
				callback(null, {
					uid: uid
				});
				
			} else {
				// New User
				var success = function(uid) {
					User.setUserField(uid, 'vkontakteid', vkontakteID);
					db.setObjectField('vkontakteid:uid', vkontakteID, uid);
					callback(null, {
						uid: uid
					});
				};

				User.getUidByEmail(email, function(err, uid) {
					if (!uid) {
						User.create({username: username, email: email}, function(err, uid) {
							if (err !== null) {
								callback(err);
							} else {
								success(uid);
							}
						});
					} else {
						success(uid); // Existing account -- merge
					}
				});
			}
		});
	};

	vkontakte.getUidByvkontakteID = function(vkontakteID, callback) {
		db.getObjectField('vkontakteid:uid', vkontakteID, function(err, uid) {
			if (err) {
				callback(err);
			} else {
				callback(null, uid);
			}
		});
	};

	vkontakte.addMenuItem = function(custom_header, callback) {
		custom_header.authentication.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		callback(null, custom_header);
	};

	function renderAdmin(req, res, callback) {
		res.render('sso/vkontakte/admin', {});
	}

	vkontakte.init = function(app, middleware, controllers) {
		app.get('/admin/vkontakte', middleware.admin.buildHeader, renderAdmin);
		app.get('/api/admin/vkontakte', renderAdmin);
	};

	module.exports = vkontakte;
}(module));
