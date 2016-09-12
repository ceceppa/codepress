
/*
API Testing

Test:

- all the generatos
- all the single generator templates

The generatos must return the following fields:

- _link - is the link use to show/embed the
 */
describe('boilergen API testing', function() {
  describe('boilerplates: ' + BG_URL + '/generators', function() {
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
  return describe('Testing generators', function() {
    var generator, i, len, results;
    results = [];
    for (i = 0, len = generators.length; i < len; i++) {
      generator = generators[i];
      results.push(describe('Testing generator: ' + generator.slug, function() {
        describe('Testing response', function() {
          beforeAll(function(done) {
            spyOn(console, 'error');
            return boilerGenAPI(BG_URL + 'generators/' + generator.slug, 'get', null, done);
          });
          it('should not fail', function() {
            return expect(console.error).not.toHaveBeenCalled();
          });
          return it('response should be an object', function() {
            return expect(testingResponse).toEqual(jasmine.any(Object));
          });
        });
        return describe('Testing templates', function() {
          var j, key, len1, ref, results1;
          ref = templates[generator.slug];
          results1 = [];
          for (j = 0, len1 = ref.length; j < len1; j++) {
            key = ref[j];
            results1.push(describe('Testing: ' + key.title, function() {
              var template;
              template = key;
              beforeAll(function(done) {
                spyOn(console, 'error');
                return boilerGenAPI(BG_URL + 'template/' + generator.slug + '/' + template.slug, 'get', null, done);
              });
              it('should not fail', function() {
                return expect(console.error).not.toHaveBeenCalled();
              });
              it('link should be angularjs route', function() {
                return expect(template.link.indexOf('#/')).toBeGreaterThan(0);
              });
              return it('isTemplate should be true', function() {
                return expect(template.isTemplate).toBeTruthy();
              });
            }));
          }
          return results1;
        });
      }));
    }
    return results;
  });
});
