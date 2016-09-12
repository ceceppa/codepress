###
Test AngularJS services
 ###
# codepress = {
#   "home":"http:\/\/codepress.dev",
#   "assets":"http:\/\/codepress.dev\/wp-content\/themes\/bpg\/assets\/",
#   "views":"http:\/\/codepress.dev\/wp-content\/themes\/bpg\/views\/",
#   "root":"http:\/\/codepress.dev\/wp-content\/themes\/bpg",
#   "addon":{
#     "wordpress":"http:\/\/codepress.dev\/wp-content\/plugins\/codepress-wordpress\/"},
#     "version":"1.0",
#     "api":"http:\/\/codepress.dev\/wp-json\/wp\/v2"
#   }
describe 'Test AngularJS filters', ->
  $filter = ''

  beforeEach ->
    module 'codepress'

    inject (_$filter_) ->
      $filter = _$filter_


  #check to see if it does what it's supposed to do.
  it 'cpGenerators factory should be defined', ->
    expect($filter).toBeDefined()

  it 'escape: should escape the string', ->
    expect( $filter('escape')("Hello \'World\'") ).toEqual 'Hello \\\'World\\\''

  it 'nodash: should replace "-" with "_"', ->
    string = $filter('nodash')('Hello-World')
    expect( string ).toEqual 'Hello_World'
#
# describe 'Test AngularJS Services', ->
#   cpGenerators = null
#
#   beforeEach ->
#     module 'codepress'
#
#     inject (_cpGenerators_) ->
#       cpGenerators = _cpGenerators_
#
#   it 'cpGenerators factory should be defined', ->
#     expect(cpGenerators).toBeDefined()
#
#   describe 'getAll', ->
#     result = ''
#     beforeAll ->
#       spyOn console, 'error'
#       @promise = cpGenerators.getAll()
#
#       @promise.then (response) ->
#         result = response.data
#         console.log response
#
#     it 'should not fail', ->
#       expect(console.error).not.toHaveBeenCalled()
#
#     it 'should return an object', () ->
#       expect(result).toBe jasmine.any(Object)
