const reduce = function(f, acc, s) {
  const current = m.prop.combine(function(s) {
    acc = f( current() || acc, s());
    return acc;
  }, [s]);
  return current
};
module.exports = reduce