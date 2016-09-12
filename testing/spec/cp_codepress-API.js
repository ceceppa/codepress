
/*
 * API Testing the main API endpoints
 */
var sendToToken;

sendToToken = null;

describe('Checking if the API is UP: ', function() {
  describe('Main: ' + BG_URL, function() {
    beforeAll(function(done) {
      spyOn(console, 'error');
      return boilerGenAPI(BG_URL, 'get', null, done);
    });
    it('should not fail', function() {
      return expect(console.error).not.toHaveBeenCalled();
    });
    it('response should be an object', function() {
      return expect(testingResponse).toEqual(jasmine.any(Object), "Api response must be an Object: " + testingResponse);
    });
    it("/routes should be an object", function() {
      return expect(testingResponse.routes).toEqual(jasmine.any(Object), "Routes list can't be empty");
    });
    it("/generators should be an object", function() {
      console.log(testingResponse.routes);
      return expect(testingResponse.routes['/v1/generators']).toEqual(jasmine.any(Object), "/generators route must exists");
    });
    return it("/codepress should be an object", function() {
      console.log(testingResponse.routes);
      return expect(testingResponse.routes['/v1/codepress']).toEqual(jasmine.any(Object), "/generators route must exists");
    });
  });
  describe('Generators: ' + BG_URL + 'generators', function() {
    beforeAll(function(done) {
      spyOn(console, 'error');
      return boilerGenAPI(BG_URL + 'generators', 'get', null, done);
    });
    it('should not fail', function() {
      return expect(console.error).not.toHaveBeenCalled();
    });
    return it('response should be an object', function() {
      return expect(testingResponse).toEqual(jasmine.any(Object), "/boilerplates must be an Object: " + testingResponse);
    });
  });
  describe('"sendto": ' + BG_URL + 'sendCodeTo', function() {
    describe('Sending custom message', function() {
      beforeAll(function(done) {
        spyOn(console, 'error');
        return boilerGenAPI(BG_URL + 'sendto', 'post', '{"code": "...testing...", "slug": "_test_", "pageId": -1}', done);
      });
      it('should not fail', function() {
        return expect(console.error).not.toHaveBeenCalled();
      });
      it('response should be an object', function() {
        return expect(testingResponse).toEqual(jasmine.any(Object));
      });
      return it('response should return a token', function() {
        sendToToken = testingResponse.token;
        return expect(testingResponse.token).toBeDefined();
      });
    });
    return describe('Retrieving custom message', function() {
      beforeAll(function(done) {
        spyOn(console, 'error');
        return boilerGenAPI(BG_URL + 'sendto', 'get', {
          token: sendToToken
        }, done);
      });
      it('sendToToken var should not be empty', function() {
        return expect(sendToToken).not.toBeNull();
      });
      return it("response should be = '...testing...'", function() {
        return expect(testingResponse.data).toEqual("...testing...", "response must match with the test string");
      });
    });
  });
  return describe('"counter": ' + BG_URL + 'counter', function() {
    describe('Incrementing counter', function() {
      beforeAll(function(done) {
        spyOn(console, 'error');
        return boilerGenAPI(BG_URL + 'counter', 'post', '{"action": "...testing...", "slug": "_test_", "pageId": -1}', done);
      });
      it('should not fail', function() {
        return expect(console.error).not.toHaveBeenCalled();
      });
      it('response should be an object', function() {
        return expect(testingResponse).toEqual(jasmine.any(Object));
      });
      return it('response should contain the "done" key', function() {
        return expect(testingResponse.done).toEqual(1);
      });
    });
    return describe('Incrementing counter', function() {
      beforeAll(function(done) {
        spyOn(console, 'error');
        return boilerGenAPI(BG_URL + 'counter', 'get', null, done);
      });
      it('response should be an object', function() {
        return expect(testingResponse).toEqual(jasmine.any(Object));
      });
      it("response should contain 'clipboard' key", function() {
        return expect(testingResponse.clipboard).toBeDefined();
      });
      it("response should contain 'sendto' key", function() {
        return expect(testingResponse.sendto).toBeDefined();
      });
      return it("response should contain 'total' key", function() {
        return expect(testingResponse.total).toBeDefined();
      });
    });
  });
});
