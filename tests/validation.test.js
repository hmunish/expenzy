const sanitizeData = require('../utilities/sanitize-data');

describe('it should return sanitized version of input', () => {
  test('should remove html tags from strings', () => {
    expect(sanitizeData("<script>alert('hacked')</script>")).toBeFalsy();
  });
});
