const expect = require("chai").expect;
const sinon = require("sinon");

const mongoose = require("mongoose");

const authController = require("../controller/auth");
const User = require("../models/user");

describe("Auth controller-login", () => {
    it("should throw 500 error if accssing database fails", (done) => {
        sinon.stub(User, "findOne");
        User.findOne.throws();

        const req = {
            body: {
                email: "abc@abc.com",
                password: "password",
            },
        };

        authController
            .login(req, {}, () => {})
            .then((result) => {
                expect(result).to.be.an("error");
                expect(result).to.have.property("statusCode", 500);
                done();
            });

        sinon.restore();
    });

    it("shoule get a response with status code 200 while posting login", (done) => {
        mongoose
            .connect(
                "mongodb+srv://fatony:hsYansE9PSyD2JIa@cluster0.lqa7wj7.mongodb.net/test-database?retryWrites=true&w=majority&appName=Cluster0"
            )
            .then((result) => {
                return User.deleteMany({ email: "abc@abc.com" });
            })
            .then((result) => {
                const user = new User({
                    email: "abc@abc.com",
                    username: "test",
                    password: "password",
                    _id: "6912e44e73de44fb278bad41",
                });
                return user.save();
            })
            .then(() => {
                const req = {
                    body: {
                        email: "abc@abc.com",
                        password: "password",
                    },
                };

                const res = {
                    _statusCode: null,
                    status(code) {
                        this._statusCode = code;
                        return this;
                    },

                    json: (data) => {
                        return data;
                    },
                };

                return authController
                    .login(req, res, () => {})
                    .then((result) => {
                        expect(res).to.have.property("_statusCode", 200);
                        expect(result.userStatus).to.equal("New user");
                        expect(result.userId).to.equal(
                            "6912e44e73de44fb278bad41"
                        );
                        expect(result).to.have.property("token");
                        done();
                    });
            })
            .catch(done);
    });
});
