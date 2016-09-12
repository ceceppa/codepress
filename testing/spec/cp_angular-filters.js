
/*
Test AngularJS services
 */
describe('Test AngularJS filters', function() {
  var $filter;
  $filter = '';
  beforeEach(function() {
    module('codepress');
    return inject(function(_$filter_) {
      return $filter = _$filter_;
    });
  });
  it('cpGenerators factory should be defined', function() {
    return expect($filter).toBeDefined();
  });
  it('escape: should escape the string', function() {
    return expect($filter('escape')("Hello \'World\'")).toEqual('Hello \\\'World\\\'');
  });
  return it('nodash: should replace "-" with "_"', function() {
    var string;
    string = $filter('nodash')('Hello-World');
    return expect(string).toEqual('Hello_World');
  });
});
