const isSupported = require('../isSupported');

describe('isSupported.js', () => {
    it('isSupported with single browser argument', () => {
        expect(isSupported('array-find', 'chrome 69')).toBeTruthy();
        expect(isSupported('intersectionobserver', 'chrome 69')).toBeTruthy();
        expect(isSupported('intersectionobserver', 'chrome 50')).toBeFalsy();
    });

    it('isSupported with multiple browsers argument', () => {
        expect(isSupported('border-radius', 'chrome 45, ie 11')).toBeTruthy();
    });

    describe('handles errors', () => {
        it('isSupported throws error on unknown feature', () => {
            expect(() => isSupported('flat', 'chrome 69')).toThrowError(new ReferenceError('Please provide a proper feature name. Cannot find flat'));
        });

        it('isSupported throws error on unknown browser', () => {
            expect(() => isSupported('intersectionobserver', 'safari 12.0.2')).toThrowError(new ReferenceError('browser is an unknown version: safari 12.0.2'));
        });

        it('isSupported throw errors with unknown feature is param', () => {
            expect(() => isSupported('foobar', 'chrome 70')).toThrowError(new ReferenceError('Please provide a proper feature name. Cannot find foobar'));
        });

        it('isSupported throw errors when unknown browser is param', () => {
            expect(() => isSupported('intersectionobserver', 'foobar')).toThrowError(new ReferenceError('Unknown browser query `foobar`. Maybe you are using old Browserslist or made typo in query.'));
        });
    })
});
