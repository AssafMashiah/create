define([
	'lodash', 
	'jquery', 
	'modules/MigrationUtil/commandMigration', 
	'modules/MigrationUtil/courseMigrationConfig'
	], function(_, 
		$, 
		commandMigration, 
		courseMigrationConfig) {

	function migrationUtil() {

	}

	_.extend(migrationUtil.prototype, {

		/**
		* update (Recursion)
		* update is the only API for the migration utils.
		* analyze the migration type, migrate ( or not ) and return 
		*/
		update: function(json){

			// set json as a member
			this.json = json;

			var jsonDetails = this.getJsonDetails();
			var migrateToVersion = this.need_to_migrate(jsonDetails);

			if (migrateToVersion){
				// ren commands migtation
				this.json = commandMigration.migrate(migrateToVersion.commands, this.json);
				// migrate to the closest version
				this.json = migrateToVersion.fnc(this.json);
				// change the schema version
				this.json = migration[jsonDetails.migrationType].setSchemaVersion(this.json, migrateToVersion.version);
				// recursion: update again 
				// migrate to the latest version
				return this.update(this.json);
			} else {
				// if there is no migrating - return the json
				return this.json;
			}

		},

		/**
		* getMigrationType
		* @return { String }
		*/
		getMigrationType: function(){
			return this.json ? this.json.type : null;
		},

		/**
		* 	need_to_migrate
		* 	check if there is a need to migrte this json
		*	if not, return null.
		*	if there is a need, return the relevant json:
		*	@param: jsonDetails { JSON }
		*	@returns: {
		*				version: { Real },
		*				fnc: { function }
		*			  }
		*/
		need_to_migrate: function(jsonDetails){

			var migrationByType, migrateToVersion = null, versionMap;

			// check validation existance for this specific json type
			if (!jsonDetails.migrationType || !migration[ jsonDetails.migrationType ]) return null;

			// get the migtation options {JSON} for this specific json type
			migrationByType = migration[ jsonDetails.migrationType ].options;

			if (!migrationByType) return false;

			// get version map (sample:) [1, 2, 3, 4] 
			versionMap = _.pluck(migrationByType, 'version');

			// set closest version (JSON) to migrateToVersion
			versionMap.every(function(item, idx){
				if (jsonDetails.schemaDetails.version < item){
					migrateToVersion = migrationByType[idx];
					return false;
				} else {
					return true;
				}
			});

			return migrateToVersion;
		},

		/**
		*	getJsonDetails
		*	analyze schema and return it's type and version
		*	@returns:{
		*		migrationType: { String },
		*		schemaDetails: {
		*			original: { String - original schema version sample: course_v1_2_ph1 },
		*			version : { Real - get real version from original format }
		*		}
		*	}
		*/
		getJsonDetails: function(){

			var migrationType = this.getMigrationType(), 
				schemaDetails = null;

			if (this.json && this.json.schema){
				schemaDetails = {
					original: this.json.schema,
					version: getSchemaVersion(this.json.schema)
				}
			}

			return {
				migrationType: migrationType,
				schemaDetails: schemaDetails
			}
		},
 
		config: {
			schemaTemplate: 'course_v'
		}

	}); // end prototype extention


	//********************** PRIVATE FNC *****************************

	/**
	*	getSchemaVersion
	*	@param schema
	*	convert [sample] "course_v1_0_ph1" to 1 of "course_v2" to 2
	*	return { Int }
	*/
	function getSchemaVersion(schema){
		
		if (!schema) return null;

		if (schema.indexOf('ph1') > -1) return 1;

		return parseInt(schema.replace('course_v', ''));
	}


	/** migration
	*	migration configuration by type
	*/
	var migration = {
		course : courseMigrationConfig
	}

	return new migrationUtil();

});