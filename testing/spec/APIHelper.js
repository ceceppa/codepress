var boilerGenAPI, testingCallback, testingCalls, testingHTMLData, testingResponse;

testingResponse = null;

testingCallback = null;

testingCalls = {
  calls: [],
  mostRecent: function() {
    return jQuery.deserialize(this.calls[this.calls.length - 1]);
  },
  push: function(data) {
    return this.calls.push(data.data);
  }
};

testingHTMLData = {
  data: [],
  push: function(data) {
    var d, field, i, len;
    d = {};
    for (i = 0, len = data.length; i < len; i++) {
      field = data[i];
      d[field.id] = field.innerHTML;
    }
    return this.data.push(d);
  },
  mostRecent: function() {
    return this.data[this.data.length - 1];
  }
};

boilerGenAPI = function(url, type, data, testingCallback) {
  testingResponse = '';
  console.info('API', url);
  return $.ajax({
    url: url,
    type: type,
    dataType: 'json',
    data: data,
    success: function(response) {
      testingResponse = response;
      console.info(response);
      return testingCallback.apply();
    },
    error: function(response) {
      testingResponse = response;
      console.error(response);
      return testingCallback.apply();
    }
  });
};
