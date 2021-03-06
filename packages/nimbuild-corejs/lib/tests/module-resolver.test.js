const {getModules} = require('../module-resolver');
const {
    getSupported,
    getBaseFeatureModules,
    initializeSupported
} = require('../supported-sets');
const mockuas = require('../mocks/ua.mock');

describe('module-resolver.js', () => {
    let include;
    let exclude;
    let mockLogger; //eslint-disable-line

    beforeEach(() => {
        initializeSupported();
        mockLogger = {
            log: jest.fn()
        };
        const featureSet = getSupported('default', {
            log: console.log
        });
        include = featureSet.include;
        exclude = featureSet.exclude;
    });

    it('Resolves chrome UA to list of coreJS modules', async () => {
        const features = getBaseFeatureModules({
            include,
            exclude
        });
        const response = await getModules({
            features,
            uaString: mockuas.chrome,
            minify: false,
            logger: mockLogger
        });

        expect(response.corejs.length).toEqual(0);
        expect(response.normal.length).toEqual(0);
        expect(response).toMatchSnapshot();
    });

    it('Resolves ie11 UA to list of coreJS modules', async () => {
        const features = getBaseFeatureModules({
            include,
            exclude
        });
        const response = await getModules({
            features,
            uaString: mockuas.ie11,
            minify: false,
            logger: mockLogger
        });

        expect(response.corejs.length).toEqual(110);
        expect(response.normal.length).toEqual(3);
        expect(response).toMatchSnapshot();
    });

    it('Resolves future versions of chrome to modern bundle', async () => {
        const features = getBaseFeatureModules({
            include,
            exclude
        });
        const response = await getModules({
            features,
            uaString: mockuas.chrome999,
            minify: false,
            logger: mockLogger
        });

        expect(response.corejs.length).toEqual(0);
        expect(response.normal.length).toEqual(0);
        expect(response).toMatchSnapshot();
    });
});
