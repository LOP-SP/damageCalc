/**
 damageCalc's test suite
*/

TestCase("CalcTest", {
	setUp: function () {
		calc = DAMAGECALC.calc
		
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
	
	"test DAMAGECALC.calc should be an object": function () {
		assertObject(DAMAGECALC.calc);
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

TestCase("EngineTest", {
	setUp: function () {
	 engine = DAMAGECALC.engine;
		
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
		assertObject(engine.turnIntoInput({}));
	},
	
	"test turnIntoInput should return an input object": function () {
		assertNotUndefined(engine.turnIntoInput(this.stats).level);
		assertNotUndefined(engine.turnIntoInput(this.stats).basePower);
		assertNotUndefined(engine.turnIntoInput(this.stats).atk);
		assertNotUndefined(engine.turnIntoInput(this.stats).def);
		assertNotUndefined(engine.turnIntoInput(this.stats).mod1);
		assertNotUndefined(engine.turnIntoInput(this.stats).mod2);
		assertNotUndefined(engine.turnIntoInput(this.stats).mod3);
		assertNotUndefined(engine.turnIntoInput(this.stats).stab);
		assertNotUndefined(engine.turnIntoInput(this.stats).effect);
		assertNotUndefined(engine.turnIntoInput(this.stats).hasMultiscale);

	},
	
	"test turnIntoInput should return a valid input object": function () {
		var q =engine.turnIntoInput(this.stats);
		
		assertTrue(q.level > 0 && q.level < 101);
		assertTrue(q.basePower > 0);
		assertTrue(q.atk > 0);
		assertTrue(q.def > 0);
		assertTrue(q.stab === 1 || q.stab === 1.5);
		assertTrue(q.effect > 0.2 && q.effect <= 4);
	},
	
	"test createResults should return an object": function () {
		assertObject(engine.createResults(this.input));
	},
	
	"test createResults should return a results object with minDamage and maxDamage": function () {
		assertNumber(engine.createResults(this.input).minDamage);
		assertNumber(engine.createResults(this.input).maxDamage);
	},
	
	"test createResults returned object should also contain damages with CH": function () {
		assertNumber(engine.createResults(this.input).minChDamage);
		assertNumber(engine.createResults(this.input).maxChDamage);
	},
		
	"test createDamageTable should return a string": function () {
		assertString(engine.createDamageTable(this.results));
	},
	
	"test createDamageTable should return a table inside div.damage": function() {
		assertMatch(/<div\sclass=\'damage\'\s*>.*<table(.*?)>.*<\/table>\s*\n?<\/div?/im,engine.createDamageTable(this.results));
	},
	
	"test getErrorMessage should return a string": function () {
		assertString(engine.getErrorMessage());
	},
	
	"test checkIfSomePropertyIs should return boolean": function () {
		assertBoolean(engine.checkIfSomePropertyIs({}, undefined));
	},
	
	"test checkIfSomePropertyIs should return true if some property is stuff": function () {
		assertTrue(engine.checkIfSomePropertyIs({p: undefined}, undefined));
		assertTrue(engine.checkIfSomePropertyIs({p: false}, false));
		assertTrue(engine.checkIfSomePropertyIs({p: "xica"}, "xica"));
	},
	
	"test checkIfSomePropertyIs should return false if no property is stuff": function () {
		assertFalse(engine.checkIfSomePropertyIs({}, undefined));
		assertFalse(engine.checkIfSomePropertyIs({}, false));
		assertFalse(engine.checkIfSomePropertyIs({}, "xica"));
	},
	
	"test checkIfTypeOfPropertiesIs should return boolean": function () {
		assertBoolean(engine.checkIfTypeOfPropertiesIs({}, "derp"));
	},
	
	"test checkIfTypeOfPropertiesIs should return true if all props are of type stuff": function () {
		assertTrue(engine.checkIfTypeOfPropertiesIs({p: "adfas"}, "string"));
		assertTrue(engine.checkIfTypeOfPropertiesIs({p: 13123}, "number"));
		assertTrue(engine.checkIfTypeOfPropertiesIs({p: function () {}}, "function"));
	},
	
	"test checkIfTypeOfPropertiesIs should return false if some prop isn't of type stuff": function () {
		assertFalse(engine.checkIfTypeOfPropertiesIs({p: 4233}, "string"));
		assertFalse(engine.checkIfTypeOfPropertiesIs({p: "fds"}, "number"));
		assertFalse(engine.checkIfTypeOfPropertiesIs({p: undefined}, "function"));
	},
	
	"test checkIfTypeOfPropertiesIs shouldn't consider NaN a number": function () {
		assertFalse(engine.checkIfTypeOfPropertiesIs({p: NaN}, "number"));
	},
		
	"test hasHP should return boolean": function () {
		assertBoolean(engine.hasHP({}));
		assertTrue(engine.hasHP({
			hp: 500
		}));
		assertFalse(engine.hasHP({}));
	},
	
	"test hasHP should return true only if HP exists and is a number": function () {
		assertTrue(engine.hasHP({
			hp: 214
		}));
		
		assertFalse(engine.hasHP({
			hp: "I'm not a number!"
		}));
	},
	
	"test translateEffect should return number or undefined": function () {
		assertNumber(engine.translateEffect("0.5x"));
		assertNumber(engine.translateEffect("1x"));
		
		assertUndefined(engine.translateEffect("5"));
		assertUndefined(engine.translateEffect(4));
		assertUndefined(engine.translateEffect({}));
	},
	
	"test translateEffect should return correct value": function () {
		assertEquals(2,engine.translateEffect("2x"));
		assertEquals(0.25,engine.translateEffect("0.25x"));
	},
	
	"test translateStatModifier should return number or undefined": function () {
		assertNumber(engine.translateStatModifier("+4"));
		assertNumber(engine.translateStatModifier("-3"));
		
		assertUndefined(engine.translateStatModifier("12"));
		assertUndefined(engine.translateStatModifier(231));
		assertUndefined(engine.translateStatModifier({}));
	},
	
	"test translateStatModifier should return correct value": function () {
		assertEquals(0.5,engine.translateStatModifier("-2"));
		assertEquals(3.5,engine.translateStatModifier("5"));
		assertEquals(2.5,engine.translateStatModifier("+3"));
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