import { VALIDATORS, validateOne, validate } from '../src/component/utils/validation';
import { ValidatorType, IAdapterMethodParams, IValidator } from 'src/component/interfaces/index';

const {
  MANDATORY,
  INTEGER,
  INTEGER_UNLIMITED,
  ITERATOR_CALLBACK,
  BOOLEAN,
  ITEM_LIST,
  ONE_OF_CAN,
  ONE_OF_MUST,
  CALLBACK_WITH_N_AND_MORE_ARGS,
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
      // { value: undefined, parsed: NaN },
      { value: null, parsed: NaN },
    ];

    it('should pass limited integer', (done: Function) => {
      integerPassInputs.forEach(input => {
        const parsed = validateOne(input, 'value', [INTEGER]);
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
        const parsed = validateOne(input, 'value', [INTEGER]);
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
        const parsed = validateOne(input, 'value', [INTEGER_UNLIMITED]);
        expect(parsed.value).toEqual(input.parsed);
        expect(parsed.isValid).toEqual(true);
      });
      done();
    });

    it('should block non unlimited integer', (done: Function) => {
      integerBlockInputs.forEach(input => {
        const parsed = validateOne(input, 'value', [INTEGER_UNLIMITED]);
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
      badInputs.forEach(input =>
        expect(
          validateOne({ value: input }, 'value', [ITERATOR_CALLBACK]).isValid
        ).toEqual(false)
      );
      expect(
        validateOne({ value: (item: any) => null }, 'value', [ITERATOR_CALLBACK]).isValid
      ).toEqual(true);
      done();
    });
  });

  describe('[One of', () => {
    const value = 1;
    const test = 2;
    const add = 3;

    it('should pass only one of twos', (done: Function) => {
      expect(validateOne({ value }, 'value', [ONE_OF_CAN(['value'])]).isValid).toEqual(false);
      expect(validateOne({ value }, 'value', [ONE_OF_CAN(['test'])]).isValid).toEqual(true);
      expect(validateOne({ value }, 'test', [ONE_OF_CAN(['value'])]).isValid).toEqual(true);
      expect(validateOne({ value }, 'test', [ONE_OF_CAN(['test'])]).isValid).toEqual(true);
      expect(validateOne({ value, test }, 'value', [ONE_OF_CAN(['value'])]).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'test', [ONE_OF_CAN(['value'])]).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'value', [ONE_OF_CAN(['test'])]).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'test', [ONE_OF_CAN(['test'])]).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'test', [ONE_OF_CAN(['testX'])]).isValid).toEqual(true);
      done();
    });

    it('should pass only one of many', (done: Function) => {
      expect(validateOne({ value, test, add }, 'value', [ONE_OF_CAN(['test', 'add'])]).isValid).toEqual(false);
      expect(validateOne({ value, test, add }, 'value', [ONE_OF_CAN(['value', 'add'])]).isValid).toEqual(false);
      expect(validateOne({ value, test, add }, 'value', [ONE_OF_CAN(['test', 'value'])]).isValid).toEqual(false);
      expect(validateOne({ value, test, add }, 'value', [ONE_OF_CAN(['test', 'valueX'])]).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'value', [ONE_OF_CAN(['test', 'add'])]).isValid).toEqual(false);
      expect(validateOne({ value, test }, 'value', [ONE_OF_CAN(['testX', 'addX'])]).isValid).toEqual(true);
      expect(validateOne({ value }, 'value', [ONE_OF_CAN(['test', 'add'])]).isValid).toEqual(true);
      expect(validateOne({ test }, 'value', [ONE_OF_CAN(['test', 'add'])]).isValid).toEqual(true);
      expect(validateOne({ test, add }, 'value', [ONE_OF_CAN(['test', 'add'])]).isValid).toEqual(true);
      done();
    });
  });
});


describe('Validation', () => {

  describe('[Context]', () => {
    it('should not pass bad context', () => {
      expect(validate(null, {}).isValid).toBe(false);
      expect(validate(false, {}).isValid).toBe(false);
      expect(validate(12, {}).isValid).toBe(false);
      expect(validate('bad', {}).isValid).toBe(false);
      expect(validate(() => null, {}).isValid).toBe(false);
      expect(validate({}, {}).isValid).toBe(true);
    });
  });

  describe('[Mandatory]', () => {
    it('should not pass missed mandatory fields', () => {
      const token = 'test';
      const run = (context: any, validators: IValidator[]) =>
        validate(context, {
          [token]: {
            name: token,
            validators
          }
        }).isValid;
      expect(run({}, [])).toBe(true);
      expect(run({}, [MANDATORY])).toBe(false);
      expect(run({ [token]: 1 }, [MANDATORY])).toBe(true);
    });

    it('should deal with mandatory and some other validation', () => {
      const token = 'test';
      const run = (context: any, validators: IValidator[]) =>
        validate(context, {
          [token]: {
            name: token,
            validators
          }
        }).isValid;
      expect(run({}, [MANDATORY, INTEGER])).toBe(false);
      expect(run({ [token]: 'x' }, [MANDATORY, INTEGER])).toBe(false);
      expect(run({ [token]: 1 }, [MANDATORY, INTEGER])).toBe(true);
    });
  });

  describe('[One of must]', () => {
    const opt1 = 'opt1';
    const opt2 = 'opt2';

    it('should not pass empty context or empty params', () => {
      expect(validate({}, {
        [opt1]: {
          name: opt1,
          validators: [ONE_OF_MUST([opt2])]
        },
        [opt2]: {
          name: opt2,
          validators: [ONE_OF_MUST([opt1])]
        }
      }).isValid).toBe(false);

      expect(validate({}, {
        [opt1]: {
          name: opt1,
          validators: [ONE_OF_MUST([])]
        },
        [opt2]: {
          name: opt2,
          validators: [ONE_OF_MUST([])]
        }
      }).isValid).toBe(false);
    });

    it('should not pass if more than 1 param is present', () => {
      expect(validate({
        [opt1]: 1, [opt2]: 2
      }, {
        [opt1]: {
          name: opt1,
          validators: [ONE_OF_MUST([opt2])]
        },
        [opt2]: {
          name: opt2,
          validators: [ONE_OF_MUST([opt1])]
        }
      }).isValid).toBe(false);

      const result = validate({
        [opt1]: 1, [opt2]: 2
      }, {
        [opt1]: {
          name: opt1,
          validators: [ONE_OF_MUST([opt2, 'opt3'])]
        },
        [opt2]: {
          name: opt2,
          validators: [ONE_OF_MUST(['opt3'])]
        }
      });
      expect(result.isValid).toBe(false);
      expect(result.params[opt1].isValid).toBe(false);
      expect(result.params[opt2].isValid).toBe(true);
    });

    it('should pass if only 1 param is present', () => {
      const result = validate({
        [opt1]: 1
      }, {
        [opt1]: {
          name: opt1,
          validators: [ONE_OF_MUST([opt2])]
        },
        [opt2]: {
          name: opt2,
          validators: [ONE_OF_MUST([opt1])]
        }
      });
      expect(result.isValid).toBe(true);
      expect(result.params[opt1].isSet).toBe(true);
      expect(result.params[opt2].isSet).toBe(false);
    });
  });

  describe('[Item List]', () => {
    const token = 'test';

    it('should not pass non-array', () => {
      const run = (context: any, validators: IValidator[]) =>
        validate(context, {
          [token]: {
            name: token,
            validators
          }
        }).isValid;
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
        [token]: {
          name: token,
          validators: [ITEM_LIST]
        }
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
          [token]: {
            name: token,
            validators: [ITEM_LIST]
          }
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
          [token]: {
            name: token,
            validators: [ITEM_LIST]
          }
        }).isValid).toBe(true)
      );
    });
  });

  describe('[Function with arguments]', () => {
    it('should pass function with 2 or more arguments', () => {
      const token = 'test';
      const run = (context: any) =>
        validate(context, {
          [token]: {
            name: token,
            validators: [CALLBACK_WITH_N_AND_MORE_ARGS(2)]
          }
        }).isValid;
      expect(run({})).toBe(true);
      expect(run({ [token]: 1 })).toBe(false);
      expect(run({ [token]: {} })).toBe(false);
      expect(run({ [token]: () => null })).toBe(false);
      expect(run({ [token]: (x: any) => null })).toBe(false);
      expect(run({ [token]: (x: any, y: any) => null })).toBe(true);
      expect(run({ [token]: (x: any, y: any, z: any) => null })).toBe(true);
    });
  });

});
