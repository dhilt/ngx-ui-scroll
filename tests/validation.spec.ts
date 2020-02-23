import { InputValueType, validate } from '../src/component/utils/validation';

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
      { value: undefined, parsed: NaN },
      { value: null, parsed: NaN },
    ];

    it('should pass limited integer', (done: Function) => {
      integerPassInputs.forEach(input => {
        const parsed = validate(input.value, InputValueType.integer);
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
        const parsed = validate(input.value, InputValueType.integer);
        expect(parsed).toEqual({
          value: input.parsed,
          type: InputValueType.integer,
          isValid: false,
          error: 'it must be an integer'
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
        const parsed = validate(input.value, InputValueType.integerUnlimited);
        expect(parsed.value).toEqual(input.parsed);
        expect(parsed.isValid).toEqual(true);
      });
      done();
    });

    it('should block non unlimited integer', (done: Function) => {
      integerBlockInputs.forEach(input => {
        const parsed = validate(input.value, InputValueType.integerUnlimited);
        expect(parsed).toEqual({
          value: input.parsed,
          type: InputValueType.integerUnlimited,
          isValid: false,
          error: 'it must be an integer or +/- Infinity'
        });
      });
      done();
    });
  });

  describe('[Iterator callback]', () => {
    it('should pass only one-argument function', (done: Function) => {
      const type = InputValueType.iteratorCallback;
      expect(validate(1, type).isValid).toEqual(false);
      expect(validate(true, type).isValid).toEqual(false);
      expect(validate({}, type).isValid).toEqual(false);
      expect(validate('test', type).isValid).toEqual(false);
      expect(validate(() => null, type).isValid).toEqual(false);
      expect(validate((a: any, b: any) => null, type).isValid).toEqual(false);
      expect(validate((item: any) => null, type).isValid).toEqual(true);
      done();
    });
  });
});
