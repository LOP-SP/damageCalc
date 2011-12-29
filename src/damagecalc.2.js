/*
damageCalc
@author: Carlos "Onox" Agarie
@version 2.0
Project URL: www.github.com/agarie/damageCalc
License: MIT License
*/

"use strict";

var DAMAGECALC = {};

// DAMAGECALC.io is the module used to get values from the UI and to print
// out damage tables, error messages, etc
DAMAGECALC.io = (function () {
	return {
		getStatsFromTheUi: function () {
			var stats = {};
		
			stats = {
				level: $("#damagecalc input[name='level']").val() || 100,
				atk: $("#damagecalc input[name='atk']").val(),
				atkStatModifier: $(" select[name='atkStatModifier']").val(),
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
		}
	};
}());

/*
DAMAGECALC.calculator is the module responsible for all the mathematical stuff,
like the damage formula itself (duh), percentages and OHKO probabilities.
*/
DAMAGECALC.calculator = (function () {
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
			criticalHit
			stab
			effect
			hasMultiscale
		randomMultiplier: number between 0.85 and 1.00.
	
		Output: damage (number).
		*/
		damageCalc: function (input, randomMultiplier) {
			var damage = 0;

			// Damage Formula = (((((((Level × 2 ÷ 5) + 2) × BasePower × [Sp]Atk ÷ 50) ÷ [Sp]Def) × Mod1) + 2) × 
			//                 CH × Mod2 × R ÷ 100) × STAB × Type1 × Type2 × Mod3)

			// After each "step" in the damage formula, we need to round down the result.
			damage = Math.floor(((input.level * 2) / 5) + 2);
			damage = Math.floor(damage * input.basePower * input.atk / 50);
			damage = Math.floor(damage / input.def);
			damage = Math.floor(damage * input.mod1 + 2);
			damage = Math.floor(damage * input.criticalHit);
			damage = Math.floor(damage * input.mod2);

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
	
		Output: The probability of delivering a OHKO (between 0 and 100).
		*/
		ohko: function (input, hp, times) {
			var prob = 0,
			    i = 0;
			
			times = times || 1;
		
			for (i = 1.0; i > 0.84; i = i - 0.01) {
				if (this.damageCalc(input, i) * times >= hp) {
					prob += (1 / 16);
				}
			}
		
			return this.toPercent(prob);
		}
	};
}());

// DAMAGECALC.translator is the module responsible for turning raw data from
// the UI into an usable input object for DAMAGECALC.calculator. Also, it
// handles the creation of damage tables.
DAMAGECALC.translator = (function () {
	/*
	This module must handle all the interconnections between items, abilities
	and whatever else. It stores items and abilities' effects in a constant.
	
	... How to take care of multiple cases? And the values applied (or not)?
	
	The raw_data object given to us from DAMAGECALC.io contains whatever was
	selected from the UI. The items/abilities are now selected in a <select>
	tag, not in a shitload of checkboxes anymore.
	*/
	
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
		createDamageTable: function (results) {
			var html = "";
			
			if (typeof results.minDamage !== "number" || typeof results.maxDamage !== "number" || results.minDamage < 0 || results.maxDamage < 0) {
				throw {
				        name: "TypeError",
				        message: "createDamageTable needs positive valued results.minDamage and results.maxDamage"
				    };
			}
			
			html += "<h1>Resultados</h1>";
			html += "<div class='damage'><table>";
			
			html += "<tr><td>" + results.minDamage + " - " + results.maxDamage + "</td></tr>";
			
			html += "</table></div>";
			
			return html;
		},
		
		// Checks if the given object has a property HP
		// and if it is a number 
		hasHP: function (obj) {
			if (obj === undefined) {
				throw {
					name: "TypeError",
					message: "DAMAGECALC.translator.hasHP(obj) needs an object input"
				};
			}
			
			return (obj.hp !== undefined);
		},
	};
}());

// DAMAGECALC.operator is the brain behind the damage calculator. 
// For example, it controls which kind of damage table the translator
// module creates and what UI should be presented.
DAMAGECALC.operator = (function () {
	
}());

// DAMAGECALC.i18n is an internationalization module yet to be implemented.
DAMAGECALC.i18n = (function () {
}());