/*
damageCalc
@author: Carlos "Onox" Agarie
@version 2.0
Project URL: www.github.com/agarie/damageCalc
License: MIT License
*/

"use strict";

// damageCalc's namespace. 
var DAMAGECALC = {
	io: {},
	calc: {},
	engine: {},
	operator: {}
};

// Get values from the UI and print damage tables and error messages.
DAMAGECALC.io = (function () {
	return {
		getStatsFromTheUi: function () {
			var stats = {};
		
			stats = {
				level: $("#damagecalc input[name='level']").val() || 100,
				atk: $("#damagecalc input[name='atk']").val(),
				atkStatModifier: $("#damagecalc select[name='atkStatModifier']").val(),
				basePower: $("#damagecalc input[name='basePower']").val(),
				stab: $("#damagecalc input[name='stab']").is(':checked'),
				effect: $("#damagecalc select[name='effect']").val(),
				isBurn: $("#damagecalc input[name='isBurn']").is(':checked'),
				
				def: $("#damagecalc input[name='def']").val(),
				defStatModifier: $("#damagecalc select[name='defStatModifier']").val(),
				hp: $("#damagecalc input[name='hp']").val(),
				isReflectActive: $("#damagecalc input[name='isReflectActive']").is(':checked'),
				
				atkItems: $("#damagecalc select[name='atkItems']").val(),
				atkAbilities: $("#damagecalc select[name='atkAbility']").val(),
				defItems: $("#damagecalc select[name='defItems']").val(),
				defAbilities: $("#damagecalc select[name='defAbility']").val()
			};
		
			return stats;
		},
		
		showResultsOnUi: function (damageTable) {
			if (typeof damageTable !== "string") {
				throw {
					name: "TypeError",
					message: "damageTable must be a string (at DAMAGECALC.io.showResultsOnUi())"
				};
			}
			
			if ($("#damagecalc .damage").length) {
				$("#damagecalc .damage").remove();
			}
			
			$("#damagecalc").append(damageTable);
		},
		
		// Used to display the current Atk/Def, with modifiers applied
		showCurrentStat: function (statName, statValue) {
			$("#damagecalc span#" + statName.toLowerCase() + "FinalValue").html(statValue);
		}
	};
}());


// Implements the damage formula itself and other helpers,
// like percentages and OHKO probabilities.
DAMAGECALC.calc = (function () {
	return {
		/*
		Implementation of the damage formula.
	
		input: object with the following parameters:
			level
			basePower
			atk
			def
			mod1
			mod2
			mod3
			stab
			effect
			hasMultiscale
		randomMultiplier: number between 0.85 and 1.00.
	
		Output: damage (number).
		*/
		damageCalc: function (input, randomMultiplier, criticalHit) {
			var damage = 0;
			
			randomMultiplier = randomMultiplier || 1;
			criticalHit = criticalHit || 1;

			// Damage Formula = (((((((Level × 2 ÷ 5) + 2) × BasePower × [Sp]Atk ÷ 50)
			// ÷ [Sp]Def) × Mod1) + 2) × CH × Mod2 × R ÷ 100) × STAB × Type1 × Type2 × Mod3)

			// After each "step" in the damage formula, we need to round down the result.
			damage = Math.floor(((input.level * 2) / 5) + 2);
			damage = Math.floor(damage * input.basePower * input.atk / 50);
			damage = Math.floor(damage / input.def);
			damage = Math.floor(damage * input.mod1 + 2);
			damage = Math.floor(damage * criticalHit * input.mod2);

			// This is where randomness takes place.
			// Cache the damage before here and loop through the possible values for the random multiplier (0.85, 0.86, ..., 0.99, 1)
			damage = Math.floor(damage * randomMultiplier);

			damage = Math.floor(damage * input.stab);
			damage = Math.floor(damage * input.effect);
			damage = Math.floor(damage * input.mod3);

			// Multiscale cuts the damage in half when active
			damage = Math.floor(damage * input.hasMultiscale);

			return damage;
		},
		
		/*
		A helper function to generate percentages.
	
		value: a Number object.

		Output: value*100, which is a number.
		*/
		toPercent: function (value) {
			return parseFloat(((value) * 10 * 10).toFixed(1));
		},
	
		/*
		Generates the probability of a pokemon OHKOing the other.
	
		input: object with the necessary parameters.
		hp: foe's HP.
		times: if it's an OHKO, 2HKO, etc. (integer)
		criticalHit: the multiplier. (1 = not CH, 2 = CH, 3 = CH with Sniper)
	
		Output: The probability of delivering a OHKO (between 0 and 100).
		*/
		ohko: function (input, hp, times, criticalHit) {
			var prob = 0,
			    i = 0;
			
			times = times || 1;
			criticalHit = criticalHit || 1;
		
			for (i = 1.0; i > 0.84; i = i - 0.01) {
				if (this.damageCalc(input, i, criticalHit) * times >= hp) {
					prob += (1 / 16);
				}
			}
		
			return this.toPercent(prob);
		}
	};
}());

// Responsible for turning raw data from
// the UI into an usable input object for DAMAGECALC.calculator. Also, it
// handles the creation of damage tables.
DAMAGECALC.engine = (function () {
	var ITEM_TABLE = {
		choice: ["atk", 1.5],
		lifeOrb: ["atk", 1.3],
		typeBoost: ["atk", 1.2],
		expertBelt: ["atk", 1.2, "effect", function (e) { return e > 1; }],
		soulDew: ["atk", 1.5],
		eviolite: ["def", 1.5],
		resistBerry: ["def", 1.5, "effect", function (e) { return e > 1; }]
	},
	    ABILITY_TABLE = {
		guts: ["atk", 1.5],
		flashFire: ["atk", 1.5],
		sandForce: ["atk", 1.5],
		purePower: ["atk", 2],
		sheerForce: ["atk", 1.3],
		technician: ["atk", 1.5, "basePower", function (e) { return e > 60; }],
		reckless: ["atk", 1.2],
		multiscale: ["def", 0.5],
		solidRock: ["def", 0.75, "effect", function (e) { return e > 1; }],
		marvelScale: ["def", 1.5]
	},
	    ERROR_MESSAGE = "Algo errado.";
	
	/*
	// Critical hits ignores defense multipliers...
	if (isCriticalHit === 2) {
		damage = Math.floor( damage * stats.defStatModifier / stats.def );
	}
	else {
		damage = Math.floor( damage / stats.def );
	}

	// ... and Reflect/Light Screen.
	if (stats.isReflectActive !== 1 && isCriticalHit === 2) {
		damage = Math.floor( ( damage * stats.mod1 * 2 ) + 2 ); 
	}
	else {
		damage = Math.floor( damage * stats.mod1 + 2 );
	}
	*/
	
	return {
		// Translates a stats object into an input one
		turnIntoInput: function (stats) {
			if (this.checkIfSomePropertyIs(stats, undefined)) {
				throw {
					name: "TypeError",
					message: "In DAMAGECALC.translator.createResults, input can't have undefined properties."
				};
			}
			
			// Basic parsing
			var input = {
				level: parseInt(stats.level, 10),
				basePower: parseInt(stats.basePower, 10),
				atk: parseInt(stats.atk, 10),
				def: parseInt(stats.def, 10),
				mod1: 1,
				mod2: 1,
				mod3: 1,
				stab: stats.stab ? 1.5 : 1,
				effect: this.translateEffect(stats.effect),
				hasMultiscale: 1
			};
						
			// Now use the ITEM_TABLE and ABILITY_TABLE constants
			// to parse the (atk|def)Items and (atk|def)Ability
			// and update Atk, Def, basePower, mod(1|2|3) and hasMultiscale
			
			return input;
		},
		
		createResults: function (input) {
			if (this.checkIfSomePropertyIs(input, undefined)) {
				throw {
					name: "TypeError",
					message: "In DAMAGECALC.translator.createResults, input can't have undefined properties."
				};
			}
			
			var results = {
				minDamage: DAMAGECALC.calculator.damageCalc(input, 0.85),
				maxDamage: DAMAGECALC.calculator.damageCalc(input, 1),
				minChDamage: DAMAGECALC.calculator.damageCalc(input, 0.85, 2),
				maxChDamage: DAMAGECALC.calculator.damageCalc(input, 1, 2)
			};
			
			return results;
		},
		
		createDamageTable: function (results) {
			if (!this.checkIfTypeOfPropertiesIs(results, "number")) {
				throw {
					name: "TypeError",
					message: "In DAMAGECALC.translator.createDamageTable(results), results must have numeric properties."
				};
			}
			
			var html = "";
			
			html += "<div class='damage'><h1>Resultados</h1><table>";
			
			html += "<tr><td>" + results.minDamage + " - " + results.maxDamage + "</td></tr>";
			
			html += "</table></div>";
			
			return html;
		},
		
		getErrorMessage: function () {
			return ERROR_MESSAGE;
		},
		
		// Check if SOME PROPERTY of obj is stuff
		// Ex.: checkIfSomePropertyIs({p: undefined}, undefined)
		// results in "true"
		checkIfSomePropertyIs: function (obj, stuff) {
			var result = false;
			
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					if (obj[p] === stuff) {
						result = true;
					}
				}
			}
			
			return result;
		},
		
		// Check if ALL PROPERTIES are of type "stuff"
		// NaN isn't considered a number in this method.
		checkIfTypeOfPropertiesIs: function (obj, stuff) {
			var result = true;
			
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					if (typeof obj[p] !== stuff || (stuff === "number" && isNaN(obj[p]))) {
						result = false;
					}
				}
			}
			
			return result;
		},
		
		// Checks if the given object has a property 'hp'
		// and if it is a number 
		hasHP: function (obj) {
			// Can't look at an undefined object's property!
			if (obj === undefined) {
				return false;
			}
			
			return typeof obj.hp === "number";
		},
		
		translateEffect: function (effect) {
			if (typeof effect === "string") {
				effect = effect.replace(/([0-9])\s?x/ig, "$1");
			}
			else {
				return undefined;
			}
			
			if (effect === '4') {
				return 4;
			}
			else if (effect === '2') {
				return 2;
			}
			else if (effect === '1') {
				return 1;
			}
			else if (effect === '0.5') {
				return 0.5;
			}
			else if (effect === '0.25') {
				return 0.25;
			}
		},
		
		translateStatModifier: function (statModifier) {
			if (typeof statModifier === "string") {
				statModifier = statModifier.replace(/\+/g, "");
			}
			else {
				return undefined;
			}
			
			if (statModifier === '0') { return 1; }
			else if (statModifier === '1') { return 1.5; }
			else if (statModifier === '2') { return 2; }
			else if (statModifier === '-1') { return 0.6667; }
			else if (statModifier === '-2') { return 0.5; }
			else if (statModifier === '3') { return 2.5; }
			else if (statModifier === '4') { return 3; }
			else if (statModifier === '5') { return 3.5; }
			else if (statModifier === '6') { return 4; }
			else if (statModifier === '-3') { return 0.4; }
			else if (statModifier === '-4') { return 0.3333; }
			else if (statModifier === '-5') { return 0.2857; }
			else if (statModifier === '-6') { return 0.25; }
		}
	};
}());

// DAMAGECALC.operator is the brain behind the damage calculator. 
// For example, it controls which kind of damage table the translator
// module creates and what UI should be presented.
DAMAGECALC.operator = (function () {
	
})();