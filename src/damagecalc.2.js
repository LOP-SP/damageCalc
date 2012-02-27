/**
damageCalc  
@author: Carlos "Onox" Agarie  
@version 2.0
@license MIT  
*/

"use strict";

// damageCalc's namespace. 
var DAMAGECALC = {
	io: {},
	calc: {},
	engine: {}
};

/**
 Get values from the UI and print damage tables and error messages.
*/
DAMAGECALC.io = (function () {
	return {
		// Reads all the inputs and stores in an object that can be returned
		// or, given as a parameter, can be modified.
		getStatsFromTheUi: function (stats) {
			var _stats = stats || {};
			
			_stats = {
				level: parseInt($("#damagecalc input[name='level']").val(), 10) || 100,
				atk: parseInt($("#damagecalc input[name='atk']").val(), 10),
				atkStatModifier: $("#damagecalc select[name='atkStatModifier']").val(),
				basePower: parseInt($("#damagecalc input[name='basePower']").val(), 10),
				stab: $("#damagecalc input[name='stab']").is(':checked'),
				effect: $("#damagecalc select[name='effect']").val(),
				isBurn: $("#damagecalc input[name='isBurn']").is(':checked'),
				
				def: parseInt($("#damagecalc input[name='def']").val(), 10),
				defStatModifier: $("#damagecalc select[name='defStatModifier']").val(),
				hp: parseInt($("#damagecalc input[name='hp']").val(), 10),
				isReflectActive: $("#damagecalc input[name='isReflectActive']").is(':checked'),
				
				atkItems: $("#damagecalc select[name='atkItems']").val(),
				atkAbilities: $("#damagecalc select[name='atkAbility']").val(),
				defItems: $("#damagecalc select[name='defItems']").val(),
				defAbilities: $("#damagecalc select[name='defAbility']").val()
			};
			
			if (!stats) {
				return _stats;				
			}
		},
		
		showResultsOnUi: function (damageTable) {
			var base = '#damagecalc ';
			var output = '#output'; // Where the results are appended
			var div = '<div id="output"></div>';
			
			// Zeroes the padding-bottom of #damagecalc to agree with div#output's
			// CSS.
			//
			// Do nothing if damageTable isn't a string.
			if (!$(base + output).length && (typeof damageTable === 'string')) {
				$(base).css({
					'padding-bottom': '0'
				})
				$(base).append(div);
				$(base + output).html(damageTable);	
			}
		},
		
		createDamageTable: function (results) {
			var html = "";
		
			html += "<h1 class='center'>Resultados</h1><table class='center'>";
			html += "<tr><td>Dano normal: ";
			
			if (results.minPercent && results.maxPercent) {
				html += results.minPercent + ' - ' + results.maxPercent;
				html += ' (' + results.minDamage + " - " + results.maxDamage + ')';
			}
			else {
				html += results.minDamage + " - " + results.maxDamage;
			}
			
			html += "</td></tr>";
			html += "<tr><td class='critical'>Critical Hit: ";
			
			if (results.minChPercent && results.maxChPercent) {
				html += results.minChPercent + ' - ' + results.maxChPercent;
				html += ' (' + results.minChDamage + " - " + results.maxChDamage + ')';
			}
			else {
				html += results.minChDamage + " - " + results.maxChDamage;
			}
						
			html += "</td></tr>";
			html += "</table></div>";
		
			return html;
		},
		
		// Used to display the current Atk/Def, with modifiers applied
		// Must introduce spans to hold these values!!
		showCurrentStat: function (statName, statValue) {
			$("#damagecalc span#" + statName.toLowerCase() + "FinalValue").html(statValue);
		}
	};
}());

/**
 Implements the damage formula itself and other helpers,
 like percentages and OHKO probabilities.
*/
DAMAGECALC.calc = (function () {
	return {
		/**
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
			effect1
			hasMultiscale
		randomMultiplier: number between 0.85 and 1.00.
		criticalHit: 1, 2 or 3.
	
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
			damage = Math.floor(damage * randomMultiplier);
			
			damage = Math.floor(damage * input.stab);
			damage = Math.floor(damage * input.effect);
			damage = Math.floor(damage * input.mod3);

			// Multiscale cuts the damage in half when active
			damage = Math.floor(damage * input.hasMultiscale);

			return damage;
		},
		
		/**
		A helper function to generate percentages.
	
		value: a Number object.
		string: the string to append to the output. Default: '%'.

		Output: (value*100)%, which is a string.
		*/
		toPercent: function (value, string) {
			var posfix = string || '%';
			
			return parseFloat(((value) * 10 * 10).toFixed(1)).toString() + posfix;
		},
	
		/**
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

/**
 Contains all the logic needed to correctly calculate the damage given
 the interactions between items, abilities and other parameters.
*/
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
	};
    
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
		createResults: function (stats) {
			var input = this.turnIntoInput(stats);
			var dmg = DAMAGECALC.calc.damageCalc;
			var toPercent = DAMAGECALC.calc.toPercent;
			
			var results = {
				minDamage: dmg(input, 0.85),
				maxDamage: dmg(input, 1),
				minChDamage: dmg(input, 0.85, 2),
				maxChDamage: dmg(input, 1, 2)
			};
						
			if (stats.hp > 0) {
				results.minPercent = toPercent(results.minDamage / stats.hp);
				results.maxPercent = toPercent(results.maxDamage / stats.hp);
				results.minChPercent = toPercent(results.minChDamage / stats.hp);
				results.maxChPercent = toPercent(results.maxChDamage / stats.hp);
			}
		
			return results;
		},
			
		// Translates a stats object into an input one
		turnIntoInput: function (stats) {
			// Basic parsing
			var input = {
				level: stats.level,
				basePower: stats.basePower,
				atk: stats.atk,
				def: stats.def,
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
			
		translateEffect: function (effect) {
			if (typeof effect === "string") {
				effect = effect.replace(/([0-9])\s?x/ig, "$1");
			}
			else {
				return undefined;
			}

			switch (effect) {
				case '4': return 4;
				case '2': return 2;
				case '1': return 1;
				case '0.5': return 0.5;
				case '0.25': return 0.25;
				default: return 1;
			}
		},
	
		translateStatModifier: function (statModifier) {
			if (typeof statModifier === "string") {
				statModifier = statModifier.replace(/\+/g, "");
			}
			else {
				return undefined;
			}
		
			switch (statModifier) {
				case '0': return 1;
				case '1': return 1.5;
				case '2': return 2;
				case '-1': return 0.6667;
				case '-2': return 0.5;
				case '3': return 2.5;
				case '4': return 3;
				case '5': return 3.5;
				case '6': return 4;
				case '-3': return 0.4;
				case '-4': return 0.3333;
				case '-5': return 0.2857;
				case '-6': return 0.25;
				default: return 1;
			}
		}
	};
})();