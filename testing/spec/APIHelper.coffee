testingResponse = null
testingCallback = null
testingCalls =
  calls: []

  mostRecent: ->
    return jQuery.deserialize @calls[@calls.length - 1]

  push: (data) ->
    @calls.push data.data

testingHTMLData =
  data: []

  push: (data) ->
    d = {}
    for field in data
      d[field.id] = field.innerHTML

    @data.push d

  mostRecent: ->
    return @data[@data.length - 1]

boilerGenAPI = ( url, type, data, testingCallback ) ->
  testingResponse = '';

  console.info('API', url);
  
  $.ajax({
    url : url,
    type : type,
    dataType : 'json',
    data: data,
    success: ( response ) ->
      testingResponse = response

      console.info response
      testingCallback.apply()
    ,
    error: ( response ) ->
      testingResponse = response;

      console.error response;
      testingCallback.apply();
  })
