TestCase("CalcTest", {
	setUp: function () {
		calc = DAMAGECALC.calculator
		
		this.input = {
			level: 100,
			basePower: 100,
			atk: 400,
			def: 200,
			mod1: 1,
			mod2: 1,
			mod3: 1,
			stab: 1,
			effect: 1,
			hasMultiscale: 1
		};
		
		this.ch = 1;
	},
	
	"test DAMAGECALC.calculator should be an object": function () {
		assertObject(DAMAGECALC.calculator);
	},
	
	"test damage calc should return a number": function () {
		var randomMultiplier = 1;
		
		assertNotNaN(calc.damageCalc(this.input, randomMultiplier, this.ch));
		assertNumber(calc.damageCalc(this.input, randomMultiplier, this.ch));
	},
	
	"test damage calc should return correct min and max values": function () {
		var min = 0.85,
		    max = 1.0;
		
		assertEquals(144, calc.damageCalc(this.input, min, this.ch));
		console.log(calc.damageCalc(this.input, min, this.ch));
		assertEquals(170, calc.damageCalc(this.input, max, this.ch));
	},
	
	"test damage calc should return higher result when critical hit": function () {
		var critical = 2;
		
		assertTrue(calc.damageCalc(this.input, 1, critical) > calc.damageCalc(this.input, 1, this.ch));
	},
	
	"test toPercent should return number": function () {
		var den = 255,
		    num = 711;
		
		assertNotNaN(calc.toPercent(den / num));
		assertNumber(calc.toPercent(den / num));
	},
	
	"test toPercent should return correct value": function () {
		var den = 10,
		    num = 100;
		
		assertEquals(10, calc.toPercent(den / num));
	},
	
	"test ohko should return a number": function () {
		var hp = 333;
		
		assertNotNaN(calc.ohko(this.input, hp));
		assertNumber(calc.ohko(this.input, hp));
	},
	
	"test ohko should return a value between 0 and 100": function () {
		var hp = 437;
		
		assertTrue(calc.ohko(this.input, hp) <= 100 && calc.ohko(this.input, hp) >= 0);
	},
	
	"test ohko should return correct value": function () {
		var hp = 256;
		
		assertEquals(0, calc.ohko(this.input, hp));
		
		this.input.atk = 378;
		this.input.def = 127;
		this.input.basePower = 102;
		this.input.stab = 1.5;
		
		assertEquals(100, calc.ohko(this.input, hp));
	},
	
	"test ohko should work with 2HKO": function () {
		var hp = 240;
		
		assertEquals(100, calc.ohko(this.input, hp, 2));
	}
});

TestCase("TranslatorTest", {
	setUp: function () {
	  trans = DAMAGECALC.translator;
		
		this.stats = {
			level: "100",
			atk: "100",
			atkStatModifier: "3",
			basePower: "45",
			stab: false,
			effect: "4x",
			isBurn: false,
			
			def: "90",
			defStatModifier: "-1",
			hp: "200",
			isReflectActive: true,
			
			atkItems: "choice",
			atkAbilities: "sheerForce",
			defItems: "",
			defAbilities: "multiscale"
		};
		
		this.input = {
			level: 100,
			basePower: 100,
			atk: 400,
			def: 200,
			mod1: 1,
			mod2: 1,
			mod3: 1,
			stab: 1,
			effect: 1,
			hasMultiscale: 1
		};
		
		this.results = {
			minDamage: 100,
			maxDamage: 140,
		};
	},
	
	"test DAMAGECALC.translator should be an object": function () {
		assertObject(DAMAGECALC.translator);
	},
	
	"test turnIntoInput should return an object": function () {
		assertObject(trans.turnIntoInput({}));
	},
	
	"test turnIntoInput should return an input object": function () {
		assertNotUndefined(trans.turnIntoInput(this.stats).level);
		assertNotUndefined(trans.turnIntoInput(this.stats).basePower);
		assertNotUndefined(trans.turnIntoInput(this.stats).atk);
		assertNotUndefined(trans.turnIntoInput(this.stats).def);
		assertNotUndefined(trans.turnIntoInput(this.stats).mod1);
		assertNotUndefined(trans.turnIntoInput(this.stats).mod2);
		assertNotUndefined(trans.turnIntoInput(this.stats).mod3);
		assertNotUndefined(trans.turnIntoInput(this.stats).stab);
		assertNotUndefined(trans.turnIntoInput(this.stats).effect);
		assertNotUndefined(trans.turnIntoInput(this.stats).hasMultiscale);

	},
	
	"test turnIntoInput should return a valid input object": function () {
		var q = trans.turnIntoInput(this.stats);
		
		assertTrue(q.level > 0 && q.level < 101);
		assertTrue(q.basePower > 0);
		assertTrue(q.atk > 0);
		assertTrue(q.def > 0);
		assertTrue(q.stab === 1 || q.stab === 1.5);
		assertTrue(q.effect > 0.2 && q.effect <= 4);
	},
	
	"test createResults should return an object": function () {
		assertObject(trans.createResults(this.input));
	},
	
	"test createResults should return a results object with minDamage and maxDamage": function () {
		assertNumber(trans.createResults(this.input).minDamage);
		assertNumber(trans.createResults(this.input).maxDamage);
	},
	
	"test createResults returned object should also contain damages with CH": function () {
		assertNumber(trans.createResults(this.input).minChDamage);
		assertNumber(trans.createResults(this.input).maxChDamage);
	},
		
	"test createDamageTable should return a string": function () {
		assertString(trans.createDamageTable(this.results));
	},
	
	"test createDamageTable should return a table inside div.damage": function() {
		assertMatch(/<div\sclass=\'damage\'\s*>.*<table(.*?)>.*<\/table>\s*\n?<\/div?/im, trans.createDamageTable(this.results));
	},
	
	"test getErrorMessage should return a string": function () {
		assertString(trans.getErrorMessage());
	},
	
	"test checkIfSomePropertyIs should return boolean": function () {
		assertBoolean(trans.checkIfSomePropertyIs({}, undefined));
	},
	
	"test checkIfSomePropertyIs should return true if some property is stuff": function () {
		assertTrue(trans.checkIfSomePropertyIs({p: undefined}, undefined));
		assertTrue(trans.checkIfSomePropertyIs({p: false}, false));
		assertTrue(trans.checkIfSomePropertyIs({p: "xica"}, "xica"));
	},
	
	"test checkIfSomePropertyIs should return false if no property is stuff": function () {
		assertFalse(trans.checkIfSomePropertyIs({}, undefined));
		assertFalse(trans.checkIfSomePropertyIs({}, false));
		assertFalse(trans.checkIfSomePropertyIs({}, "xica"));
	},
	
	"test checkIfTypeOfPropertiesIs should return boolean": function () {
		assertBoolean(trans.checkIfTypeOfPropertiesIs({}, "derp"));
	},
	
	"test checkIfTypeOfPropertiesIs should return true if all props are of type stuff": function () {
		assertTrue(trans.checkIfTypeOfPropertiesIs({p: "adfas"}, "string"));
		assertTrue(trans.checkIfTypeOfPropertiesIs({p: 13123}, "number"));
		assertTrue(trans.checkIfTypeOfPropertiesIs({p: function () {}}, "function"));
	},
	
	"test checkIfTypeOfPropertiesIs should return false if some prop isn't of type stuff": function () {
		assertFalse(trans.checkIfTypeOfPropertiesIs({p: 4233}, "string"));
		assertFalse(trans.checkIfTypeOfPropertiesIs({p: "fds"}, "number"));
		assertFalse(trans.checkIfTypeOfPropertiesIs({p: undefined}, "function"));
	},
	
	"test checkIfTypeOfPropertiesIs shouldn't consider NaN a number": function () {
		assertFalse(trans.checkIfTypeOfPropertiesIs({p: NaN}, "number"));
	},
		
	"test hasHP should return boolean": function () {
		assertBoolean(trans.hasHP({}));
		assertTrue(trans.hasHP({
			hp: 500
		}));
		assertFalse(trans.hasHP({}));
	},
	
	"test hasHP should return true only if HP exists and is a number": function () {
		assertTrue(trans.hasHP({
			hp: 214
		}));
		
		assertFalse(trans.hasHP({
			hp: "I'm not a number!"
		}));
	},
	
	"test translateEffect should return number or undefined": function () {
		assertNumber(trans.translateEffect("0.5x"));
		assertNumber(trans.translateEffect("1x"));
		
		assertUndefined(trans.translateEffect("5"));
		assertUndefined(trans.translateEffect(4));
		assertUndefined(trans.translateEffect({}));
	},
	
	"test translateEffect should return correct value": function () {
		assertEquals(2, trans.translateEffect("2x"));
		assertEquals(0.25, trans.translateEffect("0.25x"));
	},
	
	"test translateStatModifier should return number or undefined": function () {
		assertNumber(trans.translateStatModifier("+4"));
		assertNumber(trans.translateStatModifier("-3"));
		
		assertUndefined(trans.translateStatModifier("12"));
		assertUndefined(trans.translateStatModifier(231));
		assertUndefined(trans.translateStatModifier({}));
	},
	
	"test translateStatModifier should return correct value": function () {
		assertEquals(0.5, trans.translateStatModifier("-2"));
		assertEquals(3.5, trans.translateStatModifier("5"));
		assertEquals(2.5, trans.translateStatModifier("+3"));
	}
});

TestCase("OperatorTest", {
	setUp: function () {
		op = DAMAGECALC.operator;
	},
	
	"test DAMAGECALC.operator must be an object": function () {
		assertObject(DAMAGECALC.operator);
	},
	
	"test activateCalculation should return boolean": function () {
		assertBoolean(op.activateCalculation());
	},
	
	"test activateCalculation should return false if an exception is caught": function () {
		assertFalse(op.activateCalculation());
	}
});