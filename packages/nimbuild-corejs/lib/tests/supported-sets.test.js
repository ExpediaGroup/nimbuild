const {
    getSupported,
    addSupported,
    initializeSupported,
    clearSupported,
    getBaseFeatureModules
} = require('../supported-sets');

describe('supported-sets.js', () => {
    let mockLogger;

    beforeEach(() => {
        initializeSupported();
        mockLogger = {
            log: jest.fn()
        };
    });

    describe('getSupported()', () => {
        it('returns full list of supported sets', async () => {
            const response = getSupported(null, mockLogger);
            expect(response).toMatchSnapshot();
        });

        it('returns include/exclude for `default`', async () => {
            const response = getSupported('default', mockLogger);
            expect(response).toMatchSnapshot();
        });

        it('returns include/exclude for `default` when given an non-defined set', async () => {
            const response = getSupported('does-not-exist', mockLogger);
            expect(response).toMatchSnapshot();
        });
    });

    describe('addSupported()', () => {
        it('throws error when given invalid options', async (done) => {
            try {
                addSupported('custom-set', {
                    include: false,
                    exclude: false
                });
                expect(false).toEqual('should have failed');
            } catch (e) {
                expect(e.message).toEqual(
                    'Invalid feature set defined: "custom-set"'
                );
                done();
            }
        });

        it('adds a new featureSet', async () => {
            const include = ['es.array'];
            const exclude = ['es.string'];
            addSupported('custom-set', {
                include,
                exclude
            });
            expect(getSupported('custom-set')).toMatchSnapshot();
        });

        it('initializes with custom featureSet', async () => {
            initializeSupported({
                'my-initial-set': {
                    include: ['es.array', 'es.array'],
                    exclude: ['es.string']
                }
            });
            expect(getSupported('my-initial-set')).toMatchSnapshot();

            const removed = clearSupported();
            expect(removed).toEqual(1);
        });

        it('clears featureSets', async () => {
            addSupported('custom-set', {
                include: ['es.array', 'es.array'],
                exclude: ['es.string']
            });
            expect(getSupported()).toMatchSnapshot();

            const removed = clearSupported();
            expect(removed).toEqual(2);
        });
    });

    describe('getBaseFeatureModules', () => {
        it('returns 0 modules', async () => {
            const response = getBaseFeatureModules({
                include: ['es.map'],
                exclude: []
            });
            expect(response).toMatchSnapshot();
        });

        it('returns base feature modules for `default`', async () => {
            const response = getBaseFeatureModules(getSupported('default'));
            expect(response).toMatchSnapshot();
        });
    });
});
