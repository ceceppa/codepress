###
API Testing

Test:

- all the generatos
- all the single generator templates

The generatos must return the following fields:

- _link - is the link use to show/embed the
###
describe 'boilergen API testing', ->
  describe 'boilerplates: ' + BG_URL + '/generators', ->
    beforeAll (done) ->
      spyOn console, 'error'
      boilerGenAPI( BG_URL + 'generators', 'get', null, done )

    it 'should not fail', ->
      expect(console.error).not.toHaveBeenCalled()

    it 'response should be an object', ->
      expect(testingResponse).toEqual(jasmine.any(Object), "/boilerplates must be an Object: " + testingResponse)

  describe 'Testing generators', ->
    for generator in generators
      describe 'Testing generator: ' + generator.slug, ->
        describe 'Testing response', ->
          beforeAll (done) ->
            spyOn console, 'error'
            boilerGenAPI BG_URL + 'generators/' + generator.slug, 'get', null, done

          # it 'link should be angularjs route', ->
          #   expect(generator.link).contains '#/'

          it 'should not fail', ->
            expect(console.error).not.toHaveBeenCalled()

          it 'response should be an object', ->
            expect(testingResponse).toEqual jasmine.any(Object)

        describe 'Testing templates', ->
          for key in templates[generator.slug]
            describe 'Testing: ' + key.title, ->
              template = key

              beforeAll (done) ->
                spyOn console, 'error'
                boilerGenAPI BG_URL + 'template/' + generator.slug + '/' + template.slug, 'get', null, done

              it 'should not fail', ->
                expect(console.error).not.toHaveBeenCalled()

              it 'link should be angularjs route', ->
                expect(template.link.indexOf('#/')).toBeGreaterThan 0

              it 'isTemplate should be true', ->
                expect(template.isTemplate).toBeTruthy()
