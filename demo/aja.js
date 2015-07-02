window.aja = function(url) {

  function core() {}

  return {
    "get": function(data) {
      return core('GET', url, data);
    }
  };

};
