const isSupported = require('../isSupported');

describe('isSupported.js', () => {
    it('isSupported with single browser argument', () => {
        expect(isSupported('chrome 69', 'array-find')).toBeTruthy();
        expect(isSupported('chrome 69', 'intersectionobserver')).toBeTruthy();
        expect(isSupported('chrome 50', 'intersectionobserver')).toBeFalsy();
    });

    it('isSupported with multiple browsers argument', () => {
        expect(isSupported('chrome 45, ie 11', 'border-radius')).toBeTruthy();
    });

    describe('handles errors', () => {
        it('isSupported throws error on unknown feature', () => {
            expect(() => isSupported('chrome 69', 'flat')).toThrowError(
                new ReferenceError(
                    'Please provide a proper feature name. Cannot find flat'
                )
            );
        });

        it('isSupported throws error on unknown browser', () => {
            expect(() =>
                isSupported('safari 12.0.2', 'intersectionobserver')
            ).toThrowError(
                new ReferenceError(
                    'Browser is an unknown version: safari 12.0.2'
                )
            );
        });

        it('isSupported throw errors with unknown feature is param', () => {
            expect(() => isSupported('chrome 70', 'foobar')).toThrowError(
                new ReferenceError(
                    'Please provide a proper feature name. Cannot find foobar'
                )
            );
        });

        it('isSupported throw errors when unknown browser is param', () => {
            expect(() =>
                isSupported('foobar', 'intersectionobserver')
            ).toThrowError(
                new ReferenceError(
                    'Unknown browser query `foobar`. Maybe you are using old Browserslist or made typo in query.'
                )
            );
        });
    });
});
