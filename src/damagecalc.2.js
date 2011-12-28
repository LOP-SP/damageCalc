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
		createDamageTable: function () {
			var html = "";
			
			html += "<div class='damage'><table>";

			html += "</table></div>";
			
			return html;
		}
	};
}());

// DAMAGECALC.operation is the brain behind which kind of view the user is
// seeing. For example, it controls which kind of damage table the translator
// module creates and what UI should be presented.
DAMAGECALC.operation = (function () {
	
}());

// DAMAGECALC.i18n is an internationalization module yet to be implemented.
DAMAGECALC.i18n = (function () {
}());