import { VALIDATORS, validateOne, validate } from '../src/component/inputs';
import { ValidatorType, IValidator } from 'src/component/interfaces';

const {
  INTEGER,
  INTEGER_UNLIMITED,
  BOOLEAN,
  OBJECT,
  ITEM_LIST,
  FUNC_WITH_X_ARGUMENTS,
  FUNC_WITH_X_AND_MORE_ARGUMENTS,
  ONE_OF_CAN,
  ONE_OF_MUST,
} = VALIDATORS;

describe('Input Params Validation', () => {

  describe('[Integer]', () => {

    const integerPassInputs = [
      { value: 23, parsed: 23 },
      { value: '23', parsed: 23 },
      { value: 0, parsed: 0 },
      { value: '0', parsed: 0 },
      { value: '-23', parsed: -23 },
      { value: -23, parsed: -23 },
      { value: '1e1', parsed: 10 },
      { value: 1e1, parsed: 10 },
      { value: 1.1e1, parsed: 11 },
    ];

    const integerBlockInputs = [
      { value: NaN, parsed: NaN },
      { value: '', parsed: NaN },
      { value: '-', parsed: NaN },
      { value: 'no', parsed: NaN },
      { value: '23no', parsed: NaN },
      { value: 23.78, parsed: 23 },
      { value: '23.78', parsed: 23 },
      { value: 1.11e1, parsed: 11 },
      { value: () => null, parsed: NaN },
      { value: {}, parsed: NaN },
      // { value: void 0, parsed: NaN },
      { value: null, parsed: NaN },
    ];

    const intProp = { validators: [INTEGER] };
    const intUnlimitedProp = { validators: [INTEGER_UNLIMITED] };

    it('should pass limited integer', (done: Function) => {
      integerPassInputs.forEach(input => {
        const parsed = validateOne(input, 'value', intProp);
        expect(parsed.value).toEqual(input.parsed);
        expect(parsed.isValid).toEqual(true);
      });
      done();
    });

    it('should block non limited integer', (done: Function) => {
      const inputs = [
        ...integerBlockInputs,
        { value: Infinity, parsed: NaN },
        { value: -Infinity, parsed: NaN },
        { value: 'Infinity', parsed: NaN },
        { value: '-Infinity', parsed: NaN },
      ];
      inputs.forEach(input => {
        const parsed = validateOne(input, 'value', intProp);
        expect(parsed).toEqual({
          value: input.parsed,
          isSet: true,
          isValid: false,
          errors: ['must be an integer']
        });
      });
      done();
    });

    it('should pass unlimited integer', (done: Function) => {
      const inputs = [
        ...integerPassInputs,
        { value: Infinity, parsed: Infinity },
        { value: -Infinity, parsed: -Infinity },
        { value: 'Infinity', parsed: Infinity },
        { value: '-Infinity', parsed: -Infinity },
      ];
      inputs.forEach(input => {
        const parsed = validateOne(input, 'value', intUnlimitedProp);
        expect(parsed.value).toEqual(input.parsed);
        expect(parsed.isValid).toEqual(true);
      });
      done();
    });

    it('should block non unlimited integer', (done: Function) => {
      integerBlockInputs.forEach(input => {
        const parsed = validateOne(input, 'value', intUnlimitedProp);
        expect(parsed).toEqual({
          value: input.parsed,
          isSet: true,
          isValid: false,
          errors: ['must be an integer or +/- Infinity']
        });
      });
      done();
    });
  });

  describe('[Iterator callback]', () => {
    it('should pass only one-argument function', (done: Function) => {
      const badInputs = [1, true, {}, 'test', () => null, (a: any, b: any) => null];
      const funcProp = { validators: [FUNC_WITH_X_ARGUMENTS(1)] };
      badInputs.forEach(input =>
        expect(
          validateOne({ value: input }, 'value', funcProp).isValid
        ).toEqual(false)
      );
      expect(
        validateOne({ value: (item: any) => null }, 'value', funcProp).isValid
      ).toEqual(true);
      done();
    });
  });

  describe('[One of', () => {
    const value = 1;
    const test = 2;
    const add = 3;
    const getProp = (list: string[]) => ({ validators: [ONE_OF_CAN(list)] });

    it('should pass only one of twos', (done: Function) => {
      expect(validateOne({ value }, 'value', getProp(['value'])).isValid).toEqual(false);
      expect(validateOne({ value }, 'value', getProp(['test'])).isValid).toEqual(true);
      expect(validateOne({ value }, 'test', getProp(['value'])).isValid).toEqual(true);
      expect(validateOne({ value }, 'test', getProp(['test'])).isValid).toEqual(true);
      expect(validateOne({ value, test }, 'value', getProp(['value'])).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'test', getProp(['value'])).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'value', getProp(['test'])).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'test', getProp(['test'])).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'test', getProp(['testX'])).isValid).toEqual(true);
      done();
    });

    it('should pass only one of many', (done: Function) => {
      expect(validateOne({ value, test, add }, 'value', getProp(['test', 'add'])).isValid).toEqual(false);
      expect(validateOne({ value, test, add }, 'value', getProp(['value', 'add'])).isValid).toEqual(false);
      expect(validateOne({ value, test, add }, 'value', getProp(['test', 'value'])).isValid).toEqual(false);
      expect(validateOne({ value, test, add }, 'value', getProp(['test', 'valueX'])).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'value', getProp(['test', 'add'])).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'value', getProp(['testX', 'addX'])).isValid).toEqual(true);
      expect(validateOne({ value }, 'value', getProp(['test', 'add'])).isValid).toEqual(true);
      expect(validateOne({ test }, 'value', getProp(['test', 'add'])).isValid).toEqual(true);
      expect(validateOne({ test, add }, 'value', getProp(['test', 'add'])).isValid).toEqual(true);
      done();
    });
  });

});

describe('Validation', () => {

  const token = 'test';
  const run = (context: any, validators: IValidator[], mandatory: boolean = false) =>
    validate(context, {
      [token]: { validators, mandatory }
    }).isValid;

  describe('Context', () => {
    it('should not pass bad context', () => {
      expect(validate(null, {}).isValid).toBe(false);
      expect(validate(false, {}).isValid).toBe(false);
      expect(validate(12, {}).isValid).toBe(false);
      expect(validate('bad', {}).isValid).toBe(false);
      expect(validate(() => null, {}).isValid).toBe(false);
      expect(validate({}, {}).isValid).toBe(true);
    });
  });

  describe('Mandatory', () => {
    it('should not pass missed mandatory fields', () => {
      expect(run({}, [])).toBe(true);
      expect(run({}, [], true)).toBe(false);
      expect(run({ [token]: 1 }, [], true)).toBe(true);
    });

    it('should deal with mandatory and some other validation', () => {
      expect(run({}, [INTEGER], true)).toBe(false);
      expect(run({ [token]: 'x' }, [INTEGER], true)).toBe(false);
      expect(run({ [token]: 1 }, [INTEGER], true)).toBe(true);
    });
  });

  describe('[One of must]', () => {
    const opt1 = 'opt1';
    const opt2 = 'opt2';

    it('should not pass empty context or empty params', () => {
      expect(validate({}, {
        [opt1]: { validators: [ONE_OF_MUST([opt2])] },
        [opt2]: { validators: [ONE_OF_MUST([opt1])] }
      }).isValid).toBe(false);

      expect(validate({}, {
        [opt1]: {
          validators: [ONE_OF_MUST([])]
        },
        [opt2]: {
          validators: [ONE_OF_MUST([])]
        }
      }).isValid).toBe(false);
    });

    it('should not pass if more than 1 param is present', () => {
      expect(validate({
        [opt1]: 1, [opt2]: 2
      }, {
        [opt1]: { validators: [ONE_OF_MUST([opt2])] },
        [opt2]: { validators: [ONE_OF_MUST([opt1])] }
      }).isValid).toBe(false);

      const result = validate({
        [opt1]: 1, [opt2]: 2
      }, {
        [opt1]: { validators: [ONE_OF_MUST([opt2, 'opt3'])] },
        [opt2]: { validators: [ONE_OF_MUST(['opt3'])] }
      });
      expect(result.isValid).toBe(false);
      expect(result.params[opt1].isValid).toBe(false);
      expect(result.params[opt2].isValid).toBe(true);
    });

    it('should pass if only 1 param is present', () => {
      const result = validate({
        [opt1]: 1
      }, {
        [opt1]: { validators: [ONE_OF_MUST([opt2])] },
        [opt2]: { validators: [ONE_OF_MUST([opt1])] }
      });
      expect(result.isValid).toBe(true);
      expect(result.params[opt1].isSet).toBe(true);
      expect(result.params[opt2].isSet).toBe(false);
    });
  });

  describe('[Item List]', () => {
    it('should not pass non-array', () => {
      [
        null,
        true,
        'test',
        123,
        { test: true }
      ].forEach(value =>
        expect(run({ [token]: value }, [ITEM_LIST])).toBe(false)
      );
    });

    it('should not pass empty array', () => {
      expect(validate({
        [token]: []
      }, {
        [token]: { validators: [ITEM_LIST] }
      }).isValid).toBe(false);
    });

    it('should not pass array with items of different types', () => {
      [
        [1, 2, true],
        ['1', '2', 3],
        [{ a: 1 }, { b: 2 }, 3]
      ].forEach(value =>
        expect(validate({
          [token]: value
        }, {
          [token]: { validators: [ITEM_LIST] }
        }).isValid).toBe(false)
      );
    });

    it('should pass array with items of the same types', () => {
      [
        ['just one item'],
        [1, 2, 3],
        ['1', '2', '3'],
        [{ a: 1 }, { b: 2 }, { a: true }]
      ].forEach(value =>
        expect(validate({
          [token]: value
        }, {
          [token]: { validators: [ITEM_LIST] }
        }).isValid).toBe(true)
      );
    });
  });

  describe('[Function with arguments]', () => {
    it('should pass function with 2 or more arguments', () => {
      const validators = [FUNC_WITH_X_AND_MORE_ARGUMENTS(2)];
      expect(run({}, validators)).toBe(true);
      expect(run({}, validators, true)).toBe(false);
      expect(run({ [token]: 1 }, validators)).toBe(false);
      expect(run({ [token]: {} }, validators)).toBe(false);
      expect(run({ [token]: () => null }, validators)).toBe(false);
      expect(run({ [token]: (x: any) => null }, validators)).toBe(false);
      expect(run({ [token]: (x: any, y: any) => null }, validators)).toBe(true);
      expect(run({ [token]: (x: any, y: any, z: any) => null }, validators)).toBe(true);
    });
  });

  describe('[Object]', () => {
    it('should pass object', () => {
      expect(run({}, [OBJECT])).toBe(true);
      expect(run({}, [OBJECT], true)).toBe(false);
      [
        1,
        true,
        '',
        () => null,
        function () {},
        [],
        null,
        class {},
        new Map(),
        new Set(),
        Symbol(),
        new Date(),
        new RegExp(''),
      ].forEach(input =>
        expect(run({ [token]: input }, [OBJECT])).toBe(false)
      );
      expect(run({ [token]: {} }, [OBJECT])).toBe(true);
      expect(run({ [token]: { x: 0 } }, [OBJECT])).toBe(true);
    });
  });

});
