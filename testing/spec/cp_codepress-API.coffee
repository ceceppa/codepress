###
# API Testing the main API endpoints
###
sendToToken = null
describe 'Checking if the API is UP: ', ->
  describe 'Main: ' + BG_URL, ->
    beforeAll (done) ->
      spyOn console, 'error'
      boilerGenAPI( BG_URL, 'get', null, done )

    it 'should not fail', ->
      expect(console.error).not.toHaveBeenCalled()

    it 'response should be an object', ->
      expect(testingResponse).toEqual(jasmine.any(Object), "Api response must be an Object: " + testingResponse)

    it "/routes should be an object", ->
      expect(testingResponse.routes).toEqual jasmine.any(Object), "Routes list can't be empty"

    it "/generators should be an object", ->
      console.log testingResponse.routes
      expect(testingResponse.routes['/v1/generators']).toEqual jasmine.any(Object), "/generators route must exists"

    it "/codepress should be an object", ->
      console.log testingResponse.routes
      expect(testingResponse.routes['/v1/codepress']).toEqual jasmine.any(Object), "/generators route must exists"

  describe 'Generators: ' + BG_URL + 'generators', ->
    beforeAll (done) ->
      spyOn console, 'error'
      boilerGenAPI( BG_URL + 'generators', 'get', null, done )

    it 'should not fail', ->
      expect(console.error).not.toHaveBeenCalled()

    it 'response should be an object', ->
      expect(testingResponse).toEqual(jasmine.any(Object), "/boilerplates must be an Object: " + testingResponse)

  describe '"sendto": ' + BG_URL + 'sendCodeTo', ->
    describe 'Sending custom message', ->
      beforeAll (done) ->
        spyOn console, 'error'
        boilerGenAPI( BG_URL + 'sendto', 'post', '{"code": "...testing...", "slug": "_test_", "pageId": -1}', done )

      it 'should not fail', ->
        expect(console.error).not.toHaveBeenCalled()

      it 'response should be an object', ->
        expect(testingResponse).toEqual jasmine.any(Object)

      it 'response should return a token', ->
        sendToToken = testingResponse.token
        expect(testingResponse.token).toBeDefined()

    describe 'Retrieving custom message', ->
      beforeAll (done) ->
        spyOn console, 'error'
        boilerGenAPI( BG_URL + 'sendto', 'get', {token: sendToToken}, done )

      it 'sendToToken var should not be empty', ->
        expect(sendToToken).not.toBeNull()

      it "response should be = '...testing...'", ->
        expect(testingResponse.data).toEqual "...testing...", "response must match with the test string"

  describe '"counter": ' + BG_URL + 'counter', ->
    describe 'Incrementing counter', ->
      beforeAll (done) ->
        spyOn console, 'error'
        boilerGenAPI( BG_URL + 'counter', 'post', '{"action": "...testing...", "slug": "_test_", "pageId": -1}', done )

      it 'should not fail', ->
        expect(console.error).not.toHaveBeenCalled()

      it 'response should be an object', ->
        expect(testingResponse).toEqual jasmine.any(Object)

      it 'response should contain the "done" key', ->
        expect(testingResponse.done).toEqual 1

    describe 'Incrementing counter', ->
      beforeAll (done) ->
        spyOn console, 'error'
        boilerGenAPI BG_URL + 'counter', 'get', null, done

      it 'response should be an object', ->
        expect(testingResponse).toEqual jasmine.any(Object)

      it "response should contain 'clipboard' key", ->
        expect(testingResponse.clipboard).toBeDefined()

      it "response should contain 'sendto' key", ->
        expect(testingResponse.sendto).toBeDefined()

      it "response should contain 'total' key", ->
        expect(testingResponse.total).toBeDefined()
