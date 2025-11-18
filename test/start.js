const expect = require("chai").expect;
const sinon = require("sinon");
const authMiddleware = require("../middleware/is-auth");

const jwt = require("jsonwebtoken");

describe("Auth middleware", () => {
    it("should throw 401 error if no Authorization header is present", () => {
        const req = {
            get: (headerName) => {
                return null;
            },
        };
        const next = (error) => {
            expect(error).to.be.an("error");
            expect(error.message).to.equal("Not authenticated.");
            expect(error.statusCode).to.equal(401);
        };

        authMiddleware(req, {}, next);
    });

    it("should throw error if Authorization header is one string", () => {
        const req = {
            get: (headerName) => {
                return "header";
            },
        };

        expect(() => authMiddleware(req, {}, () => {})).to.throw();
    });

    it("should throw error if token verify failed", () => {
        const req = {
            get: (headerName) => {
                return "Bearer somerandomtoken";
            },
        };

        expect(() => authMiddleware(req, {}, () => {})).to.throw();
    });

    it("should have a property named userId in the req object", () => {
        const req = {
            get: (headerName) => {
                return "Bearer somerandomtoken";
            },
        };

        sinon.stub(jwt, "verify");
        jwt.verify.returns({ userId: "abc" });
        authMiddleware(req, {}, () => {});

        expect(req).to.have.property("userId");
        expect(jwt.verify.called).to.equal(true);
        sinon.restore();
    });
});
