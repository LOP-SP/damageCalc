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
	
	"test damage calc should return a number": function () {
		var randomMultiplier = 1;
		
		assertNotNaN(calc.damageCalc(this.input, randomMultiplier, this.ch));
		assertNumber(calc.damageCalc(this.input, randomMultiplier, this.ch));
	},
	
	"test damage calc should return correct min and max values": function () {
		var min = 0.85,
		    max = 1.0;
		
		assertEquals(144, calc.damageCalc(this.input, min, this.ch));
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
			defAbilities: "multiScale"
		};
		
		this.results = {
			minDamage: 100,
			maxDamage: 140
		};
	},
	
	"test turnIntoInput should return an object": function () {
		assertObject(trans.turnIntoInput({}));
	},
	
	"test turnIntoInput should return an input object": function () {
		var input = trans.turnIntoInput(this.stats);
		
		assertNotUndefined(input.level);
		assertNotUndefined(input.basePower);
		assertNotUndefined(input.atk);
		assertNotUndefined(input.def);
		assertNotUndefined(input.mod1);
		assertNotUndefined(input.mod2);
		assertNotUndefined(input.mod3);
		assertNotUndefined(input.stab);
		assertNotUndefined(input.effect);
		assertNotUndefined(input.hasMultiScale);
	},
	
	"test createDamageTable should return a string": function () {
		assertString(trans.createDamageTable(this.results));
	},
	
	"test createDamageTable should return a table inside div.damage": function() {
		assertMatch(/<div\sclass=\'damage\'\s*>\s*\n?<table(.*?)>.*<\/table>\s*\n?<\/div?/im, trans.createDamageTable(this.results));
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
	}
});

TestCase("OperatorTest", {
	setUp: function () {
		op = DAMAGECALC.operator;
	},
});