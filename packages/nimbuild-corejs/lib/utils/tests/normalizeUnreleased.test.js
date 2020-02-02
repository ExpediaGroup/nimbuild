const normalizeUnreleased = require('../normalizeUnreleased');

describe('normalizeUnreleased.js', () => {
    it('normalizeUnreleased returns version if supported by browserlist', () => {
        expect(normalizeUnreleased('chrome', '69')).toEqual('69');
    });

    it('normalizeUnreleased returns most current version supported by browserlist', () => {
        expect(normalizeUnreleased('chrome', '999')).toEqual('79');
    });

    it('normalizeUnreleased handles invalid family exception and returns given version', () => {
        expect(normalizeUnreleased('icey-freezey-weasel', '999')).toEqual(
            '999'
        );
    });
});
